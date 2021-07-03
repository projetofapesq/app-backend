import subprocess

#Limpeza de memoria
comando = "echo #######  LIMPEZADO DA CACHE E SWAP INICIADO! #######"
subprocess.Popen(comando,shell=True)
comando2 = "free -h"
subprocess.Popen(comando2, shell=True)
comando3 = "echo 3 > /proc/sys/vm/drop_caches"
subprocess.Popen(comando3, shell=True)
comando4 = "sysctl -w vm.drop_caches=3 "
subprocess.Popen(comando4, shell=True)
comando5 = "swapoff -a && sudo swapon /swapfile"
subprocess.Popen(comando5, shell=True)
comando7 = "echo #######  LIMPEZADO DA CACHE E SWAP FINALIZADO! #######"
subprocess.Popen(comando7, shell=True)
comando8 = "free -h"
subprocess.Popen(comando8, shell=True)
