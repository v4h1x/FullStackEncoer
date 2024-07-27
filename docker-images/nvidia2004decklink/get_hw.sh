ma=$(cat /sys/class/net/$(ip route show default | grep default | cut -d " " -f5)/address)
echo "#define MAC_ADDRESS \"$ma\"" >> hw_constants.h
hds=$(udevadm info --query=all --name=/dev/sda | grep -oP "(?<=ID_SERIAL=).*")
echo "#define HDD_SERIAL \"$hds\"" >> hw_constants.h

