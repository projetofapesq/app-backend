import subprocess

comando = "echo ---- Limpeza Cache e Swap ----"
subprocess.Popen(comando,shell=True)
comando2 = "free -h"
subprocess.Popen(comando2, shell=True)
comando3 = "echo 3 > /proc/sys/vm/drop_caches"
subprocess.Popen(comando3, shell=True)
comando4 = "sysctl -w vm.drop_caches=3 "
subprocess.Popen(comando4, shell=True)
comando5 = "swapoff -a && swapon -a"
subprocess.Popen(comando5, shell=True)
comando6 = "clear"
subprocess.Popen(comando6, shell=True)
comando7 = "echo Limpeza do Cache e Swap efetuada com sucesso"
subprocess.Popen(comando7, shell=True)
comando8 = "free -h"
subprocess.Popen(comando8, shell=True)

