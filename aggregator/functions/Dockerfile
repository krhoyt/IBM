FROM node

ADD . /usr/src/ingest

WORKDIR /usr/src/ingest

RUN curl -fsSL https://clis.ng.bluemix.net/install/linux | sh
RUN bx plugin install cloud-functions -r Bluemix
# RUN bx login -a api.ng.bluemix.net -o "krhoyt@us.ibm.com" -s "dev"
# RUN bx wsk action invoke /whisk.system/utils/echo -p message hello --result

RUN apt-get update
RUN apt-get -y install zip

# RUN npm install mysql --save
# RUN npm install jsonfile --save
# RUN npm install request --save

# zip -r action.zip *
# ibmcloud fn action create gator/organization.delete --kind nodejs:8 action.zip
