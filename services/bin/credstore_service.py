import env

import json

from flask import Flask, request
from flask_restful import Resource, Api

from werkzeug.exceptions import NotFound,BadRequest

app = Flask(__name__)
api = Api(app)

from zeus.zookeeper_session import ZookeeperSession

CRED_STORE_ZK = "/appliance/logical/credstore"

@app.route('/')
def hello_world():
  return 'Welcome to CredStore!'

class Credentials(Resource):
  def get(self):
    bmc_ip = request.args.get("bmc_ip", None)
    with ZookeeperSession() as zks:
       creds = json.loads(zks.get(CRED_STORE_ZK))["credentials"]
       creds_list = [c for c in creds]
       if bmc_ip:
         creds_list = []
         for cred in creds:
           if cred["bmc_ip"] == bmc_ip:
             creds_list = [cred]
       return {"credentials": creds_list}

  def post(self):
    req = json.loads(request.data)
    required_keys = ["bmc_ip", "username", "password"]
    for key in required_keys:
      if key not in req:
        raise BadRequest("%s is missing"% key)
    creds_list = []
    with ZookeeperSession() as zks:
      creds = json.loads(zks.get(CRED_STORE_ZK))["credentials"]
      updated = False
      for cred in creds:
        if req["bmc_ip"] == cred["bmc_ip"]:
          creds_list.append(req)
          updated = True
        else:
          creds_list.append(cred)
      if not updated:
        creds_list.append(req)
      zks.set(CRED_STORE_ZK, json.dumps({"credentials": creds_list}))    
    return {"credentials": creds_list}

api.add_resource(Credentials, "/credentials")

if __name__ == '__main__':
  app.run(host='0.0.0.0',port=8005)
