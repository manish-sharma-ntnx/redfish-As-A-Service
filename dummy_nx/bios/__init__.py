import requests
import urllib3
import time

IPMI_IP = "10.2.129.71"
USERNAME = "ADMIN"
PASSWORD = "Nutanix1234"

def detect():
  print("Getting Bios version")
  bios_info = {}
  # Mantle_utils
  # get_ceredentials (host_ip)
  # initialize the redpool
  # check_refish_supported
  urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
  url = ("https://%s/redfish/v1/Systems/1" % IPMI_IP)
  response = requests.get(url, auth= (USERNAME, PASSWORD), verify=False)
  print("Request response: %s" % response.json())
  bios_info["Manufacturer"] = response.json().get("Manufacturer")
  bios_info["Model"] = response.json().get("Model")
  bios_info["Version"] = response.json().get("BiosVersion")
  bios_info["UUID"] = response.json().get("UUID")
  bios_info["PartNumber"] = response.json().get("PartNumber")
  bios_info["SerialNumber"] = response.json().get("SerialNumber")

  print("BIOS Info:\n %s" % bios_info)
  return bios_info


def update():
  print("Updating BIOS")

  # Step1: Get current BIOS version
  print("Step1: Get current BIOS version")
  current_bios_info = detect()

  # Step2: Enter BIOS update mode
  print("Step2: Enter BIOS update mode")
  url = ("https://%s/redfish/v1/UpdateService/SmcFirmwareInventory/"
         "BIOS/Actions/SmcFirmwareInventory.EnterUpdateMode" % IPMI_IP)
  response = requests.post(url, auth=(USERNAME, PASSWORD), data='{}',
                           verify=False)
  if response.status_code == 200:
    print("Entered BIOS update mode successfully, Message: %s" % response.text)
  else:
    print("Failed to enter BIOS update mode, Status code: %s" %
          response.status_code)
    return

  # Step3: Upload BIOS binary file
  print("Step3: Upload BIOS binary file")
  multipart_form_data = { 'bios': ('NX11DPTB9.B12.Signed.PB42.200.bin',
                                   open('NX11DPTB9.B12.Signed.PB42.200.bin',
                                        'rb')) }
  url = ("https://%s/redfish/v1/UpdateService/SmcFirmwareInventory/BIOS/"
         "Actions/SmcFirmwareInventory.Upload" % IPMI_IP)
  response = requests.post(url, files=multipart_form_data,
                           auth=(USERNAME, PASSWORD), verify=False)
  if response.status_code == 200:
    print("Successfully uploaded BIOS binary file, Message: %s" % response.text)
  else:
    print("Failed to uploaded BIOS binary file, Status code: %s" %
          response.status_code)
    return

  # Step4: Execute Update
  print("Step4: Execute Update")
  body = {"PreserveME": False, "PreserveNVRAM": False, "PreserveSMBIOS": True}
  url = ("https://%s/redfish/v1/UpdateService/SmcFirmwareInventory/BIOS/"
         "Actions/SmcFirmwareInventory.Update" % IPMI_IP)
  response = requests.post(url, auth=(USERNAME, PASSWORD), json=body,
                           verify=False)
  if response.status_code == 202:
    print("Update started successfully, Message: %s" % response.text)
    task_msg = response.json().get("Accepted").get("@Message.ExtendedInfo")[0]
    task_num = task_msg.get("MessageArgs")[0]
    task_url = ("https://%s%s" % (IPMI_IP, task_num))
    resp = requests.get(task_url, auth=(USERNAME, PASSWORD), verify=False)
    print("Update Status")
    try:
      while resp.status_code == 200 and \
              not resp.json().get("Oem").get("Percentage") == "100%":
        print(resp.text)
        time.sleep(4)
        resp = requests.get(task_url, auth=(USERNAME, PASSWORD), verify=False)
    except Exception as ex:
      print("Exception Occurred. Error: %s" % ex)
  else:
    print("Failed to Start update, Status code: %s" %
          response.status_code)
    return

  # Step5: Power Off then Power On
  print("Step5: Power Off then Power On")


  # Step6: Check the new BIOS Version
  print("Step6: Check the new BIOS Version")
  time.sleep(30)
  updated_bios_info = detect()



detect()
