
# stop script on error
set -e

# Setup build directory
rm -rf ./build
mkdir ./build

# Check to see if root CA file exists, download if not
if [ ! -f ./roveros/certs/root-CA.crt ]; then
  printf "\nDownloading AWS IoT Root CA certificate from Symantec...\n"
  curl https://www.symantec.com/content/en/us/enterprise/verisign/roots/VeriSign-Class%203-Public-Primary-Certification-Authority-G5.pem > ./roveros/certs/root-CA.crt
fi

# generate cert and key
if [ ! -f ./roveros/certs/cert.pem ]; then
    printf "\nGenerating AWS IoT keys and certificates...\n"
    aws iot create-keys-and-certificate --set-as-active --certificate-pem-outfile=./roveros/certs/cert.pem --public-key-outfile=./roveros/certs/public.key --private-key-outfile=./roveros/certs/private.key
fi

ENDPOINT=$(aws iot describe-endpoint --query endpointAddress --output text)

# Check to see if anything was returned
if [ $? -ne 0 ]
then
    exit 255
fi

echo "Found AWS IoT Endpoint: ${ENDPOINT}"

touch ./roveros/config/bootstrap.json

echo "{
  'endpoint': ${ENDPOINT}
}" > ./roveros/config/bootstrap.json

# Zip it
zip -r ./build/roborover.zip ./roveros -x ./roveros/node_modules/**\* ./roveros/*.git*

# copy
#scp ./build/roborover.zip pi@dex.local:roveros/
