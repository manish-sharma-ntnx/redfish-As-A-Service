import requests
import urllib3
import pprint
import sys

IPMI_IP = "10.2.129.68"
USERNAME = "ADMIN"
PASSWORD = "Nutanix1234"


def get_info(ipmi_ip=IPMI_IP, userid=USERNAME, pswd=PASSWORD):
  print("Getting CPU Info")
  cpu_info_list = []
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
    for temp in thermal_resp.json().get("Temperatures"):
      if "CPU" in temp.get("Name"):
        cpu_dict = {}
        cpu_dict["Name"] = temp.get("Name")
        cpu_dict["ReadingCelsius"] = temp.get("ReadingCelsius")
        proc_sub_url = temp.get("RelatedItem")[0].get("@odata.id")
        proc_url = ("https://%s%s" % (ipmi_ip, proc_sub_url))
        proc_resp = requests.get(proc_url, auth=(userid, pswd),
                                verify=False)
        cpu_dict["Manufacturer"] = proc_resp.json().get("Manufacturer")
        cpu_dict["Model"] = proc_resp.json().get("Model")
        cpu_dict["Status"] = proc_resp.json().get("Status")
        cpu_dict["TotalCores"] = proc_resp.json().get("TotalCores")
        cpu_dict["TotalThreads"] = proc_resp.json().get("TotalThreads")
        cpu_info_list.append(cpu_dict)



  print("CPU Info List\n %s" % cpu_info_list)
  return cpu_info_list


if __name__ == '__main__':
  if len(sys.argv) == 4:
    get_info(sys.argv[1], sys.argv[2], sys.argv[3])
  elif len(sys.argv) == 2:
    get_info(ipmi_ip=sys.argv[1])
  else:
    get_info()
