
# stop script on error
set -e

# Check to see if root CA file exists, download if not
if [ ! -f ./root-CA.crt ]; then
  printf "\nDownloading AWS IoT Root CA certificate from Symantec...\n"
  curl https://www.symantec.com/content/en/us/enterprise/verisign/roots/VeriSign-Class%203-Public-Primary-Certification-Authority-G5.pem > root-CA.crt
fi

# generate cert and key
if [ ! -f ./cert.pem ]; then
    printf "\nGenerating AWS IoT keys and certificates...\n"
    aws iot create-keys-and-certificate --set-as-active --certificate-pem-outfile=cert.pem --public-key-outfile=public.key --private-key-outfile=private.key
fi

npm install
