console.log("service worker started")
self.addEventListener('push', e => {
    const data = e.data.json()
    console.log(data)
    console.log("ntrecividda")

    self.registration.showNotification(data.title, {
        body: data.body,
        icon: 'https://e7.pngegg.com/pngimages/225/896/png-clipart-arch-linux-computer-icons-installation-linux-distribution-linux-blue-angle.png',
        // vibrate: [100, 50, 100],

        // data: {
        //     url: data.url
        // }
    })
})


module.exports=worker