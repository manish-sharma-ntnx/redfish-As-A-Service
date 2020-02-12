import requests
import urllib3
import pprint
import sys

IPMI_IP = "10.2.129.68"
USERNAME = "ADMIN"
PASSWORD = "Nutanix1234"


def get_info(ipmi_ip=IPMI_IP, userid=USERNAME, pswd=PASSWORD):
  print("Getting Power Info")
  power_info_list = []
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
    power_sub_url = resp.json().get("Power").get("@odata.id")
    power_url = ("https://%s%s" % (ipmi_ip, power_sub_url))
    power_resp = requests.get(power_url, auth=(userid, pswd),
                                verify=False)
    for power_supply in power_resp.json().get("PowerSupplies"):
      power_dict = {}
      power_dict["Name"] = power_supply.get("Name")
      power_dict["Status"] = power_supply.get("Status")
      power_dict["PowerSupplyType"] = power_supply.get("PowerSupplyType")
      power_dict["Model"] = power_supply.get("Model")
      power_dict["FirmwareVersion"] = power_supply.get("FirmwareVersion")
      power_info_list.append(power_dict)



  print("Power Info List\n %s" % power_info_list)
  return power_info_list


if __name__ == '__main__':
  if len(sys.argv) == 4:
    get_info(sys.argv[1], sys.argv[2], sys.argv[3])
  elif len(sys.argv) == 2:
    get_info(ipmi_ip=sys.argv[1])
  else:
    get_info()
