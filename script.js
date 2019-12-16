const imageUpload=document.getElementById('imageUpload')
Promise.all([
    faceapi.nets.faceRecognitionNet.loadFromUri('models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('models'),
  faceapi.nets.ssdMobilenetv1.loadFromUri('models')
  
]).then(start)

async function start() {
    const container = document.createElement('div')
    container.style.position = 'relative'
    
  
  document.body.append(container)
  const labeledFaceDescriotors=await loadLabeledImages() 
  const faceMatcher= new faceapi.FaceMatcher(labeledFaceDescriotors,0.7)

  document.body.append('Loaded')
    imageUpload.addEventListener('change', async () => {
    
    const image = await faceapi.bufferToImage(imageUpload.files[0])
    container.append(image)
    const canvas = faceapi.createCanvasFromMedia(image)
    container.append(canvas)
    const displaySize = { width: image.width, height: image.height }
    faceapi.matchDimensions(canvas, displaySize)
    const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors()
   const resizedDetections = faceapi.resizeResults(detections, displaySize)
    const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))
   results.forEach((result, i) => {
        const box = resizedDetections[i].detection.box
       const drawBox=new faceapi.draw.DrawBox(box,{label: result.toString() })
       drawBox.draw(canvas)
   })
   
    
  })
  
}


function loadLabeledImages() {
  const labels = ['Black Widow', 'Captain America', 'Captain Marvel', 'Hawkeye', 'Jim Rhodes', 'Thor', 'Tony Stark']
  return Promise.all(
    labels.map(async label => {
      const descriptions = []
      for (let i = 1; i <= 2; i++) {
        const img = await faceapi.fetchImage(`labeled_images/${label}/${i}.jpg`)
        const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
        descriptions.push(detections.descriptor)
      }

      return new faceapi.LabeledFaceDescriptors(label, descriptions)
    })
  )
}

