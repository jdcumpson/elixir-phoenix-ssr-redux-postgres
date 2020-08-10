openssl x509 -req \
    -days 3650 \
    -in quickstart.csr \
    -signkey quickstart.key \
    -out quickstart.crt \
    -extensions req_ext \
    -extfile ssl.conf
