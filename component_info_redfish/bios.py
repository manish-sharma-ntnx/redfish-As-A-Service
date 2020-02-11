import requests
import urllib3
import time
import sys

IPMI_IP = "10.2.129.68"
USERNAME = "ADMIN"
PASSWORD = "Nutanix1234"

def get_info(ipmi_ip=IPMI_IP, userid=USERNAME, pswd=PASSWORD):
  print("Getting Bios version")
  bios_info_list = []
  # Mantle_utils
  # get_ceredentials (host_ip)
  # initialize the redpool
  # check_refish_supported
  urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
  url = ("https://%s/redfish/v1/Systems/" % ipmi_ip)
  response = requests.get(url, auth= (userid, pswd), verify=False)
  print("Request response: %s" % response.json())
  for sys in response.json().get("Members"):
    sub_url = sys.get("@odata.id")
    sys_url = ("https://%s%s" % (ipmi_ip, sub_url))
    resp = requests.get(sys_url, auth= (userid, pswd), verify=False)
    bios_info = {}
    bios_info["Manufacturer"] = resp.json().get("Manufacturer")
    bios_info["Model"] = resp.json().get("Model")
    bios_info["Version"] = resp.json().get("BiosVersion")
    bios_info["UUID"] = resp.json().get("UUID")
    bios_info["PartNumber"] = resp.json().get("PartNumber")
    bios_info["SerialNumber"] = resp.json().get("SerialNumber")
    bios_info_list.append(bios_info)

  print("BIOS Info List:\n %s" % bios_info_list)
  return bios_info_list

if __name__ == '__main__':
  if len(sys.argv) == 4:
    get_info(sys.argv[1], sys.argv[2], sys.argv[3])
  elif len(sys.argv) == 2:
    get_info(ipmi_ip=sys.argv[1])
  else:
    get_info()
