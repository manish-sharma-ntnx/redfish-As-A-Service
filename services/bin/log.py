import env

import os
import logging
LOG_FILE_NAME = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../redpool.log"))

logging.basicConfig(filename=LOG_FILE_NAME,level=logging.INFO)

info = logging.info
warning = logging.warning
error = logging.error
