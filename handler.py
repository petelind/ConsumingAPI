import logging
import os

import app
from datawell.iex import Iex
from persistence.dynamostore import DynamoStore

@app.func_time(logger=app.get_logger(module_name='handler.lambda_handler'))
def lambda_handler(event=None, context=None):
    log_level = logging.INFO
    logger = app.get_logger(module_name=__name__, level=log_level)
    try:

        datasource = Iex(app.STOCKS, log_level=log_level)
        dynamostore = DynamoStore(app.TABLE, log_level=log_level)
        dynamostore.store_documents(documents=datasource.get_symbols())

    except app.AppException as e:
        logger.error(e.Message, exc_info=True)
        os._exit(-1)  # please note: python has no encapsulation - you can call private methods! doesnt mean you should


lambda_handler()
