import requests
import re
import os


class Stage(object):

    def runTest(self, theString):
        print(theString)

        ###############################################
        # Initialize variables from Environment setting

        osoUsername = os.environ.get('OSO_USERNAME')
        clusterAddress = os.environ.get('OSO_CLUSTER_ADDRESS')

        oso_token = os.environ.get('OSO_TOKEN')
        temp = 'Bearer ' + oso_token
        headers = {'Authorization': temp}

        # Generate a request to find the routes
        urlString = '{}/oapi/v1/namespaces/{}-stage/routes'.format(clusterAddress, osoUsername)

        r = requests.get(urlString, headers=headers)
        # r = requests.get(
        #   'https://api.starter-us-east-2.openshift.com:443/oapi/v1/namespaces/ldimaggi-stage/routes',
        #   headers=headers
        # )
        # print r.text

        respJson = r.json()
        # print respJson

        routeString = respJson['items'][0]['status']['ingress'][0]['host']
        # print routeString

        urlString = 'http://{}'.format(routeString)

        # Example staged app endpoint:
        # http://test123-ldimaggi-stage.8a09.starter-us-east-2.openshiftapps.com

        print('Starting test.....')

        r = requests.get(urlString)
        # print 'request results = {}'.format(r.text)

        result = r.text
        if re.search('Using the greeting service', result):
            return 'Success'
        else:
            return 'Fail'
