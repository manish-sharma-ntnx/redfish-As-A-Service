import requests
import urllib3
import pprint
import sys

IPMI_IP = "10.2.129.68"
USERNAME = "ADMIN"
PASSWORD = "Nutanix1234"


def get_info(ipmi_ip=IPMI_IP, userid=USERNAME, pswd=PASSWORD):
  print("Getting Memory Info")
  memory_info_list = []
  # Mantle_utils
  # get_ceredentials (host_ip)
  # initialize the redpool
  # check_refish_supported
  urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
  url = ("https://%s/redfish/v1/Systems/" % ipmi_ip)
  response = requests.get(url, auth=(userid, pswd), verify=False)
  print("Request response: %s" % response.json())
  for sys in response.json().get("Members"):
    sub_url = sys.get("@odata.id")
    sys_url = ("https://%s%s" % (ipmi_ip, sub_url))
    resp = requests.get(sys_url, auth=(userid, pswd), verify=False)
    thermal_sub_url = resp.json().get("Memory").get("@odata.id")
    thermal_url = ("https://%s%s" % (ipmi_ip, thermal_sub_url))
    memory_resp = requests.get(thermal_url, auth=(userid, pswd),
                                verify=False)
    for memory in memory_resp.json().get("Members"):
      mem_sub_url = memory.get("@odata.id")
      mem_url = ("https://%s%s" % (ipmi_ip, mem_sub_url))
      mem_resp = requests.get(mem_url, auth=(userid, pswd),
                                verify=False)
      mem_dict = {}
      mem_dict["Name"] = mem_resp.json().get("Name")
      mem_dict["CapacityMiB"] = mem_resp.json().get("CapacityMiB")
      mem_dict["MemoryType"] = mem_resp.json().get("MemoryType")
      mem_dict["MemoryDeviceType"] = mem_resp.json().get("MemoryDeviceType")
      mem_dict["Manufacturer"] = mem_resp.json().get("Manufacturer")
      mem_dict["Status"] = mem_resp.json().get("Status")
      memory_info_list.append(mem_dict)




  print("Memory Info List\n %s" % memory_info_list)
  return memory_info_list


if __name__ == '__main__':
  if len(sys.argv) == 4:
    get_info(sys.argv[1], sys.argv[2], sys.argv[3])
  elif len(sys.argv) == 2:
    get_info(ipmi_ip=sys.argv[1])
  else:
    get_info()
