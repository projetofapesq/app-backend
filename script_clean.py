import os

#Limpeza de memoria
#comando = "echo #######  LIMPEZADO DA CACHE E SWAP INICIADO! #######"
#subprocess.Popen(comando,shell=True)
#comando2 = "free -h"
#subprocess.Popen(comando2, shell=True)
#comando3 = "echo 3 > /proc/sys/vm/drop_caches"
#subprocess.Popen(comando3, shell=True)
#comando4 = "sysctl -w vm.drop_caches=3 "
#subprocess.Popen(comando4, shell=True)
#comando5 = "swapoff -a"
#subprocess.Popen(comando5, shell=True)
#comando51 = "swapon -a"
#subprocess.Popen(comando51, shell=True)
#comando6 = "sudo swapon /swapfile"
#subprocess.Popen(comando6, shell=True)
#comando7 = "echo #######  LIMPEZADO DA CACHE E SWAP FINALIZADO! #######"
#subprocess.Popen(comando7, shell=True)
#comando8 = "free -h"
#subprocess.Popen(comando8, shell=True)


os.system('free -h')
os.system('sync; echo 3 > /proc/sys/vm/drop_caches')
os.system('sysctl -w vm.drop_caches=3')
os.system('swapoff -a && swapon -a')
os.system('free -h')
