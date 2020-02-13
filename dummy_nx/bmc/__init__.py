import requests
import urllib3
import time

IPMI_IP = "10.2.129.69"
USERNAME = "ADMIN"
PASSWORD = "Nutanix1234"

def detect():
  print("Getting BMC version")
  bmc_info = {}
  urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
  url = ("https://%s/redfish/v1/Managers/1/" % IPMI_IP)
  response = requests.get(url, auth= (USERNAME, PASSWORD), verify=False)
  print("Request response: %s" % response.json())
  bmc_info["Manager type"] = response.json().get("ManagerType")
  bmc_info["Model"] = response.json().get("Model")
  bmc_info["Version"] = response.json().get("FirmwareVersion")
  bmc_info["UUID"] = response.json().get("UUID")

  print("BMC Info:\n %s" % bmc_info)
  return bmc_info


def update():
  print("Updating BMC")
  # Step1: Get current BMC version
  print("Step1: Get current BMC version")
  current_bmc_info = detect()

  # # Step2: Save BMC config.
  # print("Step2: Save BMC config.")
  # url = ("https://%s/redfish/v1/UpdateService/IPMIConfig/Actions"
  #        "/IPMIConfig.Download" % IPMI_IP)
  # response = requests.post(url, json='{}', stream=False,
  #                          auth=(USERNAME, PASSWORD), verify=False)
  # if response.status_code == 200:
  #   config_file = "save_config.bin"
  #   open(config_file, "wb").write(response.content)
  #   print("BMC config saved successfully to %s" % config_file)
  # else:
  #   print("Could not download the current BMC config, Status code: %s" %
  #         response.status_code)
  #   return
  #
  # # Step3: Enter BMC update mode
  # print("Step3: Enter BMC update mode")
  # url = ("https://%s/redfish/v1/UpdateService/SmcFirmwareInventory/BMC/"
  #        "Actions/SmcFirmwareInventory.EnterUpdateMode" % IPMI_IP)
  # response = requests.post(url, auth=(USERNAME, PASSWORD), data='{}',
  #                          verify=False)
  # if response.status_code == 200:
  #   print("Entered BMC update mode successfully, Message: %s" % response.text)
  # else:
  #   print("Failed to enter BMC update mode, Status code: %s" %
  #         response.status_code)
  #   return
  # # return
  # # Step4: Upload BMC binary file
  # print("Step4: Upload BMC binary file")
  # multipart_form_data = { 'bmc': ('NX-G7-908-5-20200211.bin',
  #                                 open('NX-G7-908-5-20200211.bin',
  #                                      'rb')) }
  # url = ("https://%s/redfish/v1/UpdateService/SmcFirmwareInventory/BMC/"
  #        "Actions/SmcFirmwareInventory.Upload" % IPMI_IP)
  # response = requests.post(url, files=multipart_form_data,
  #                          auth=(USERNAME, PASSWORD), verify=False)
  # if response.status_code == 200:
  #   print("Successfully uploaded BMC binary file, Message: %s" % response.text)
  # else:
  #   print("Failed to uploaded BMC binary file, Status code: %s" %
  #         response.status_code)
  #   return

  # Step5: Execute Update
  print("Step5: Execute Update")
  body = { "PreserveCfg": True, "PreserveSdr": True, "PreserveSsl": True }
  url = ("https://%s/redfish/v1/UpdateService/SmcFirmwareInventory/BMC/"
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

  # # Step6: Perform FD
  # print("Step6: Perform FD")
  # url = ("https://%s/redfish/v1/Managers/1/Actions/Oem/ManagerConfig.Reset"
  #        % IPMI_IP)
  # response = requests.post(url, auth=(USERNAME, PASSWORD), verify=False)
  # if response.status_code == 200:
  #   print("Successfully performed FD, Message: %s" % response.text)
  # else:
  #   print("Failed to perform FD, Status code: %s" %
  #         response.status_code)

  # Step7: Restore BMC config.
  print("Step7: Restore BMC config.")
  time.sleep(100)
  multipart_form_data = { 'ipmi_config_file':
                            ('save_config.bin', open('save_config.bin', 'rb')) }
  url = ("https://%s/redfish/v1/UpdateService/IPMIConfig/Actions/"
         "IPMIConfig.Upload" % IPMI_IP)
  response = requests.post(url, files=multipart_form_data,
                           auth=(USERNAME, PASSWORD), verify=False)
  if response.status_code == 200:
    print("Successfully restored BMC config, Message: %s" % response.text)
  else:
    print("Failed to restore BMC config, Status code: %s" %
          response.status_code)

  # Step8: Check the new BMC Version
  print("Step8: Check the new BMC Version")
  time.sleep(60)
  updated_bmc_info = detect()


update()
