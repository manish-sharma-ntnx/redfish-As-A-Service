import requests
import urllib3
import pprint
import sys

IPMI_IP = "10.2.129.68"
USERNAME = "ADMIN"
PASSWORD = "Nutanix1234"


def get_info(ipmi_ip=IPMI_IP, userid=USERNAME, pswd=PASSWORD):
  print("Getting NIC Info")
  nic_info_list = []
  # Mantle_utils
  # get_ceredentials (host_ip)
  # initialize the redpool
  # check_refish_supported
  urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
  url = ("https://%s/redfish/v1/Chassis/" % ipmi_ip)
  response = requests.get(url, auth=(userid, pswd), verify=False)
  print("Request response: %s" % response.json())
  for sys in response.json().get("Members"):
    sub_url = sys.get("@odata.id")
    sys_url = ("https://%s%s" % (ipmi_ip, sub_url))
    resp = requests.get(sys_url, auth=(userid, pswd), verify=False)
    for nic in resp.json().get("Links").get("PCIeDevices"):
      nic_sub_url = nic.get("@odata.id")
      nic_url = ("https://%s%s" % (ipmi_ip, nic_sub_url))
      nic_resp = requests.get(nic_url, auth=(userid, pswd), verify=False)
      nic_dict = {}
      nic_dict["Id"] = nic_resp.json().get("Id")
      nic_dict["Name"] = nic_resp.json().get("Name")
      nic_dict["Manufacturer"] = nic_resp.json().get("Manufacturer")
      nic_dict["Model"] = nic_resp.json().get("Model")
      nic_dict["FirmwareVersion"] = nic_resp.json().get("FirmwareVersion")
      nic_dict["Status"] = nic_resp.json().get("Status")
      nic_info_list.append(nic_dict)

  print("NIC Info List\n %s" % nic_info_list)
  return nic_info_list


if __name__ == '__main__':
  if len(sys.argv) == 4:
    get_info(sys.argv[1], sys.argv[2], sys.argv[3])
  elif len(sys.argv) == 2:
    get_info(ipmi_ip=sys.argv[1])
  else:
    get_info()
