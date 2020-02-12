import requests
import urllib3
import pprint
import sys

IPMI_IP = "10.2.129.68"
USERNAME = "ADMIN"
PASSWORD = "Nutanix1234"


def get_info(ipmi_ip=IPMI_IP, userid=USERNAME, pswd=PASSWORD):
  print("Getting Fan Info")
  fan_info_list = []
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
    thermal_sub_url = resp.json().get("Thermal").get("@odata.id")
    thermal_url = ("https://%s%s" % (ipmi_ip, thermal_sub_url))
    thermal_resp = requests.get(thermal_url, auth=(userid, pswd),
                                verify=False)
    for fan in thermal_resp.json().get("Fans"):
      fan_dict = {}
      fan_dict["Name"] = fan.get("Name")
      fan_dict["Status"] = fan.get("Status")
      fan_dict["ReadingUnits"] = fan.get("ReadingUnits")
      fan_dict["Reading"] = fan.get("Reading")
      fan_info_list.append(fan_dict)


  print("Fan Info List\n %s" % fan_info_list)
  return fan_info_list


if __name__ == '__main__':
  if len(sys.argv) == 4:
    get_info(sys.argv[1], sys.argv[2], sys.argv[3])
  elif len(sys.argv) == 2:
    get_info(ipmi_ip=sys.argv[1])
  else:
    get_info()
