import env

import json

from zeus.zookeeper_session import ZookeeperSession


CRED_STORE_ZK = "/appliance/logical/credstore"

if __name__ == "__main__":
  with ZookeeperSession() as zks:
    zks.delete(CRED_STORE_ZK)
    a = {"credentials":
          [{"bmc_ip": "10.2.129.68", "username": "ADMIN", "password": "Nutanix1234"},
           {"bmc_ip": "10.2.129.69", "username": "ADMIN", "password": "Nutanix1234"},
           {"bmc_ip": "10.2.129.70", "username": "ADMIN", "password": "Nutanix1234"},
           {"bmc_ip": "10.2.129.71", "username": "ADMIN", "password": "Nutanix1234"}
        ]}
    zks.create(CRED_STORE_ZK, json.dumps(a))
