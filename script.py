import sys, json,os
import numpy as np
import urllib.request
import cv2
#os.system('python -m pip install {}'.format("numpy"))
#os.system('python -m pip install {}'.format("opencv-python==4.2.0.32"))
#os.system('python -m pip install --upgrade pip')

def save_result(save_path, npyfile):
    for item in npyfile:
        img = (item[:, :, 0]).astype(np.uint8)

        cv2.imwrite(save_path, img) 
 
def add_colored_mask(image, mask_image):
    mask_image_gray = cv2.cvtColor(mask_image, cv2.COLOR_BGR2GRAY)
    
    mask = cv2.bitwise_and(mask_image, mask_image, mask=mask_image_gray,)
    
    mask_coord = np.where(mask!=[0,0,0])

    mask[mask_coord[0],mask_coord[1],:]=[255,0,0]

    ret = cv2.addWeighted(image, 0.7, mask, 0.3, 0)

    return ret  



#Read data from stdin
lines = sys.stdin.readlines()
x = json.loads(lines[0])
print(x[1])


#reshape data
x_mask = np.array(x[0], dtype = np.float32)
x_mask_ajust = np.reshape(x_mask, (1,512,512,1))
save_result('./resultados-Unet/mk.png', x_mask_ajust)

mask = cv2.imread("./resultados-Unet/mk.png")
img = cv2.imread(x[1])
img = cv2.resize(img, (512,512))
result = add_colored_mask(img,mask )
cv2.imwrite('./resultados-Unet/radiografia.jpeg',img)
cv2.imwrite('./resultados-Unet/segmentation.jpeg', result) 

