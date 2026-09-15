# Project-DNA
WIP! Project DNA is my personal project of creating a digital pet and virtual assistant similar to Starboy, but completely open-source, free to modify, redistribute, etc. 
This is where all the source code for all development related to Project DNA will be held.

## Helix
Helix is the name of your virtual pet. Or at least the default one. You can change this yourself if you would like. The main point of Helix is to be a digital pet accessory while still maintaining usefulness other than just for looks. By default Helix can connect to your phone via Bluetooth with no app required. This allows him to be used for his primary function: a media controller. Helix is able to be used with voice commands to play/resume your media, skip to the next song, etc. with little to no delay unlike your phones AI Assistant. Have you ever been driving yours or someone else's car and wanted to skip the current song or something, but the buttons are in an annoying spot? Well helix can solve that (as long as you are playing audio to the car stereo using your phone). Just say: "Hey Helix, Skip." or "Hey Helix, next song.". And he will react instantly and send a command to your phone to skip the song without you having to press a single button! Now, this might seem quite limited for actual capabilities, but if you install the Android app onto your phone and pair the app with Helix, he becomes much more capable. The app allows him to understand much more natural speech such as exact percentages, and other variations of certain commands like "Hey helix, turn the volume up by 12%."  But the app also allows for him to be connected to your own or a 3rd party's LLM to make him smarter. If you ask Helix a question that he doesn't have the answer to, he will ask you if you would like to escalate the question to the connected LLM. For example: 
You: "Hey Helix, how many calories are in a banana?" 
Helix: "Sorry, I don't know that info off the top of my head, want me to ask <ai name here>?" 
You: "Yes" 
Helix: "So <ai name here> said '.....'"

*This feature can be switched on or off depending on whether or not you want him to ask to escalate every time or he will just do it automatically if off.*

Also, while Helix is connected to the app, he is able to control your phone's settings if you ask him to. If you just got off of work and are in your car or something but still have DND on, you can just say: "Hey Helix, turn off do not disturb." and he will do it.

Helix can not only be useful though, he is also a cool little accessory that you can attach to anything you would like! Helix can react to his surrounding based off of what his sensors and camera tell him. Helix has a camera, two digital mics, a temperature sensor, and a motion/rotation sensor that let him to react to his surroundings. For example if he gets hot, he will show it with his expressions on the devices built in AMOLED display. If you shake him violently, his will bounce around the sides of the screen depending on how much force you use. Also, Helix has gesture and facial recognition while using his camera, so he can recognize his beloved owner. But if you flip him off, he will not be happy.

*the camera can be turned off completely if wanted. All data from the sensors and camera stay on the device itself only. Unless connected to the mobile app, which even then, your data is not shared to any third party or even to us for that matter. All of your data is controlled by you.*

## DNA Animator
<img width="192" height="192" alt="android-chrome-192x192" src="https://github.com/user-attachments/assets/1036e655-db07-47dd-a2f9-8f870a9833e0" />

This is my own self-made vector graphics animation software that I designed to be used with microcontrollers. The animator can be used to make your own "Rigs" or characters for Helix. It allows for either direct value and JSON editing or visual editing to make rig creation easier. It also allows you to easily design your own animations and display them on the Helix device live without having to flash the firmware every time you change something. This will make it easier for you to verify that what you created actually works and looks good on the actual hardware.

<img width="1599" height="852" alt="image" src="https://github.com/user-attachments/assets/a99629e5-8d96-41e0-bc87-6e6abd804aad" />
<img width="1599" height="852" alt="image" src="https://github.com/user-attachments/assets/32b6dfcd-c7a5-4131-8d72-c5df4f66fced" />
<img width="1599" height="850" alt="image" src="https://github.com/user-attachments/assets/56ce2f5d-2854-46d6-b8c5-61852d9f85f8" />
*This software is still heavily under development and has really just begun its development; so, stuff is bound to change*
