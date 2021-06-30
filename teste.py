import subprocess
import sys

comando = "echo Limpeza Cache e Swap"
subprocess.Popen(comando,shell=True)
comando2 = "free -h"
subprocess.Popen(comando2, shell=True)
comando3 = "echo 3 > /proc/sys/vm/drop_caches"
subprocess.Popen(comando3, shell=True)

