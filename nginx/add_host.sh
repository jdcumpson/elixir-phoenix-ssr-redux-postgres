echo "127.0.0.1\tquickstart.dev" >> /etc/hosts
echo "127.0.0.1\tapp.quickstart.dev" >> /etc/hosts
echo "127.0.0.1\tplugin.quickstart.dev" >> /etc/hosts
# this should now show up in /etc/hosts only once
# with the development entry like
#
# 127.0.0.1       quickstart.dev