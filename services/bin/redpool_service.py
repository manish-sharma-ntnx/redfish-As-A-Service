import env

import requests
import urllib3
import traceback

from flask import Flask, request, jsonify
from flask_restful import Resource, Api
from flask_cors import CORS

from werkzeug.exceptions import NotFound,BadRequest

import log
import consts

import bmc
import bios
import cpu
import fan

urllib3.disable_warnings()
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

from requests.packages.urllib3.exceptions import InsecureRequestWarning
requests.packages.urllib3.disable_warnings(InsecureRequestWarning)

app = Flask(__name__)
api = Api(app)
CORS(app)

@app.route('/')
def hello_world():
  return 'Welcome to Redpool!'

class Hosts(Resource):
  def get(self):
    return jsonify(consts.HOSTS)

class Host(Resource):
  def get(self, host_uuid):
    for host in consts.HOSTS["hosts"]:
      if host["uuid"] == host_uuid:
        return jsonify(host)
    raise NotFound("%s not found" % host_uuid) 

class Components(Resource):
  def get(self):
    return jsonify(consts.COMPONENTS)

class Component(Resource):
  def get(self, host_uuid):
    if consts.USE_STATIC == True:
      return jsonify(consts.COMPONENTS)
    try:
      for host in consts.HOSTS["hosts"]:
        if host["uuid"] == host_uuid:
          bmc_ip = host["ipmi_ip"]
          cred_url = "http://localhost:8005/credentials"
          response = requests.get(cred_url)
          creds = response.json()["credentials"]
         
          for cred in creds:
            if cred["bmc_ip"] == bmc_ip:
              username = cred["username"]
              password = cred["password"]
              bmc_info = bmc.get_info(ipmi_ip=bmc_ip, userid=username, pswd=password)
              bmc_list = []
              for bmc_i in bmc_info:
                bmc_list.append({"version": bmc_i["Version"],
                                 "model": bmc_i["Model"],
                                 "health": bmc_i["Status"]["Health"],
                                 "state": bmc_i["Status"]["State"]
                                })
              log.info(bmc_list)
              bios_info = bios.get_info(ipmi_ip=bmc_ip, userid=username, pswd=password)
              bios_list = []
              for bios_i in bios_info:
                bios_list.append({"version": bios_i["Version"],
                                  "model": bios_i["Model"],
                                  "serial": bios_i["SerialNumber"],
                                  "manufacturer": bios_i["Manufacturer"]
                                 })
              cpu_info = cpu.get_info(ipmi_ip=bmc_ip, userid=username, pswd=password)
              cpu_list = []
              for cpu_i in cpu_info:
                cpu_list.append({"manufacturer": cpu_i["Manufacturer"],
                                 "name": cpu_i["Name"].split()[0],
                                 "model": cpu_i["Model"],
                                 "cores": cpu_i["TotalCores"],
                                 "threads": cpu_i["TotalThreads"],
                                 "temperature": cpu_i["ReadingCelsius"],
                                 "health": cpu_i["Status"]["Health"],
                                 "state": cpu_i["Status"]["State"]
                                })
              fan_info = fan.get_info(ipmi_ip=bmc_ip, userid=username, pswd=password)
              fan_list = []
              for fan_i in fan_info:
                fan_list.append({"name": fan_i["Name"],
                                 "rpm": fan_i["Reading"],
                                 "health": fan_i["Status"]["Health"],
                                 "state": fan_i["Status"]["State"]
                                })
              return jsonify(
                     {"components": {
                                     "fan": fan_list,
                                     "cpu": cpu_list,
                                     "bmc": bmc_list,
                                     "bios": bios_list
                                    }
                     })
          raise NotFound("Credentials not found for %s" % bmc_ip)
      raise NotFound("%s not found" % host_uuid)
    except Exception as ex:
      log.error(str(traceback.format_exc()))
      return {"error" : str(traceback.format_exc())}

api.add_resource(Components, "/components")
api.add_resource(Component, "/components/<host_uuid>")
api.add_resource(Hosts, "/hosts")
api.add_resource(Host, "/hosts/<host_uuid>")

if __name__ == '__main__':
  app.run(host='0.0.0.0',port=8004, threaded=False, processes=4)
