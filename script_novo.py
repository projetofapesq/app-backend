import sys, json,os
import numpy as np
import cv2
import tensorflow
import gc 
import subprocess
from tensorflow.keras.preprocessing import image
import tensorflow.keras.backend as K
from tensorflow.keras.applications.inception_v3 import preprocess_input
from pymongo import MongoClient

#os.system('python -m pip install {}'.format("tensorflow"))

# unet functions

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

# heatmap functions

def load_img_heat(img_ad,DIM = 150):

  ORIGINAL = img_ad
  img = image.load_img(ORIGINAL, target_size=(DIM, DIM))
  x = image.img_to_array(img)
  x = np.expand_dims(x, axis=0)
  x = preprocess_input(x)

  return x

def heatmap_generation(model,x):

  with tensorflow.GradientTape() as tape:
    last_conv_layer = model.get_layer('conv2d_85')
    iterate = tensorflow.keras.models.Model([model.inputs], [model.output, last_conv_layer.output])
    model_out, last_conv_layer = iterate(x)
    class_out = model_out[:, np.argmax(model_out[0])]
    grads = tape.gradient(class_out, last_conv_layer)
    pooled_grads = K.mean(grads, axis=(0, 1, 2))
  
  heatmap = tensorflow.reduce_mean(tensorflow.multiply(pooled_grads, last_conv_layer), axis=-1)

  return heatmap

def add_colored_heatmap (heatmap,ORIGINAL):

  heatmap = np.maximum(heatmap, 0)
  print(np.max(heatmap))
  heatmap /= np.max(heatmap)
  heatmap = heatmap.reshape((3, 3))

  img = cv2.imread(ORIGINAL)
  INTENSITY = 0.3

  heatmap = cv2.resize(heatmap, (img.shape[1], img.shape[0]))

  heatmap = cv2.applyColorMap(np.uint8(255*heatmap), cv2.COLORMAP_JET)

  img = heatmap * INTENSITY + img
  
  return img


model = tensorflow.keras.models.load_model("./model_v3.h5") 

#segmentation
lines = sys.stdin.readlines()
x = json.loads(lines[0])
img = x[1]
idteste = x[3]
predictions = x[2]
image_mongo1 = x[4]
image_mongo2 = x[5]
#heatmap
img_processed = load_img_heat(img)
heatmap = heatmap_generation(model,img_processed)
img_heatmap = add_colored_heatmap(heatmap,img)

#heatmap image
cv2.imwrite('./resultados-Unet/heatmap-'+idteste+'.png', img_heatmap)

#reshape data
x_mask = np.array(x[0], dtype = np.float32)
x_mask_ajust = np.reshape(x_mask, (1,512,512,1))
save_result('./resultados-Unet/mask.png', x_mask_ajust)

mask = cv2.imread("./resultados-Unet/mask.png")
img_o = cv2.imread(x[1])
img_o = cv2.resize(img_o, (512,512))
result = add_colored_mask(img_o,mask )

#segmented image
cv2.imwrite('./resultados-Unet/radiografia-'+idteste+'.jpeg',img_o)
cv2.imwrite('./resultados-Unet/segmentation-'+idteste+'.jpeg', result)

#MONGODB
client = MongoClient("mongodb://localhost:27017")
db = client["diagnosis"]
collection = db["testes"]

caminho_radiografia = 'C:/Users/Admin/Desktop/Julio/diagnosis-final/resultados-Unet/radiografia-'+idteste+'.jpeg'
caminho_segmentation = 'C:/Users/Admin/Desktop/Julio/diagnosis-final/resultados-Unet/segmentation-'+idteste+'.jpeg'
caminho_heatmap = 'C:/Users/Admin/Desktop/Julio/diagnosis-final/resultados-Unet/heatmap-'+idteste+'.jpeg'

query_nova = { "id" : idteste, "predictions": predictions, "idimage":image_mongo1,"nomeimage":image_mongo2, "caminhoRadiografia": caminho_radiografia, "caminhoSegmentation": caminho_segmentation, "caminhoHeatmap":caminho_heatmap}

collection.insert_one( query_nova );


# Limpeza de memoria

limpeza = "echo 3 > /proc/sys/vm/drop_caches"
output_limpeza = subprocess.check_output(['bash','-c',limpeza])

