import subprocess
comando = "sudo ./limpezaCacheSwap.sh"
output = subprocess.check_output(['bash','-c',comando])