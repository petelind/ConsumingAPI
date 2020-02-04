"""
Contains Iex class which retrieves information from IEX API
"""

import json
from decimal import Decimal
import requests
import app


class Iex(object):

    def __init__(self):
        self.stock_list = []
        self.Logger = app.get_logger(__name__)
        self.Symbols = self.get_stocks()
        #self.populate_dividends()
        datapoints = ['logo', 'company']
        self.Datapoints = dict(zip(datapoints, datapoints))

    def __format__(self, format): 
        # This funny thing is called list comprehension and is a damn fast iterator...
        # Here is how it works: https://nyu-cds.github.io/python-performance-tips/08-loops/
        return "\n".join(f"{s}"  for s in self.Symbols )
        #                  ^ operand ^ subject  ^iterable 
        # (collection or whatever is able to __iter()__)

    def get_stocks(self):
        """
        Will return all the stocks being traded on IEX.
        :return: list of stock tickers and basic facts as list(), raises AppException if encountered an error
        """
        try:
            # basically we create a market snapshot
            uri = f'{app.BASE_API_URL}ref-data/Iex/symbols/{app.API_TOKEN}'
            self.stock_list = self.load_from_iex(uri)
            return self.stock_list

        except Exception as e:
            message = 'Failed while retrieving stock list!'
            ex = app.AppException(e, message)
            raise ex

    def populate_dividends(self, ticker: str = None, period: str = '1y'):
        """
        Populates symbols with dividents info
        :param ticker: str with ticker that should be populated, if None all the tickers are populated
        :param period: str with period, 1y is default value
        :return: Nothing
        """
        self.Logger.info("Populate symbols with dividents")
        #TODO we might want to do that in parallel, but I am not sure if that is not part of optimization that should
        #be done later
        try:
            for company_info in self.Symbols:
                company_symbol = company_info['symbol']
                if ticker is None or company_symbol == ticker:
                    uri = app.BASE_API_URL + f'stock/{company_symbol}/dividends/{period}' + app.API_TOKEN
                    company_info['dividends'] = self.load_from_iex(uri)
        except Exception as e:
            message = f'Failed while retrieving dividends for ticker {ticker}!'
            ex = app.AppException(e, message)
            raise ex

    def load_from_iex(self, uri: str):
        """
        Connects to the specified IEX endpoint and gets the data you requested.
        :type uri: str with the endpoint to query
        :return Dict() with the answer from the endpoint, Exception otherwise
        """
        self.Logger.info(f'Now retrieveing from {uri}')
        response = requests.get(uri)
        if response.status_code == 200:
            company_info = json.loads(response.content.decode("utf-8"), parse_float=Decimal)
            self.Logger.debug(f'Got response: {company_info}')
            return company_info
        else:
            error = response.status_code
            self.Logger.error(
                f'Encountered an error: {error} ( {response.text} ) while retrieving {uri}')
