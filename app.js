const endpoint = "https://script.google.com/macros/s/AKfycbwOOnXi7BXMwEb_pPZ-ixyToJF2y56Cw-VbwRchvWcGJIhQaZ8LobpgxbQgWrFbOsK7xw/exec";
const myKey = "CahAngon-demo";
var sendCode;
var pageData =  { type : "none"};

const container = document.querySelector("section");

function createNew(parent , elementType, content, attributes = {}) {
    if (!parent) {
      console.error(`Parent element with ID "${parentId}" not found.`);
      return null; // Return null if parent doesn't exist
    }
  
    // Create a new element
    const newElement = document.createElement(elementType);
    newElement.textContent = content;
  
    // Set attributes if provided
    for (const [key, value] of Object.entries(attributes)) {
      newElement.setAttribute(key, value);
    }
  
    // Append the new element to the parent container
    parent.appendChild(newElement);
  
    // Return the created element
    return newElement;
}
  

function setCookie(name, value, days) {
    if (name == "tokenCode"){
        // send notify for registering token into notifURL
        const contents = {
            key :  myKey,
            action : "tryLogin",
            token: value
        };

        fetch(endpoint, 
        { 
            redirect: "follow",
            method: 'POST', // Sending a POST request
            headers: {
                'Content-Type': 'text/plain;charset=utf-8', // Specify content type as text
            },
            body: JSON.stringify(contents), // Convert data to JSON string
            }
        ) .then(response => response.json()) // Handle the response
        .then(data => {
            console.log('Success: Notif', data); // Log the response from the server
            if (data.result == "OK"){
                createNew(container,"h1","Kode Valid");
                const date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000)); // Convert days to milliseconds
                const expires = `expires=${date.toUTCString()}`;
                document.cookie = `${name}=${value}; ${expires}; path=/`;
                location.reload(true);
            }else{
                createNew(container,"h1","Kode Invalid");
                // delay 3 second then reload
                setTimeout(function(){
                    reloadPage();
                },3000)
            }
        })
        .catch((error) => {
            console.error('Error:', error); // Log any error
        });
    }
}

function reloadPage() {
    location.reload(true); // Reloads the page
}

// Function to get a cookie
function getCookie(name) {
    const nameEQ = `${name}=`;
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i].trim();
        if (cookie.startsWith(nameEQ)) {
        return cookie.substring(nameEQ.length, cookie.length);
        }
    }
    return null; // Return null if the cookie doesn't exist
}

function tryAccess(){
    const contents = {
        key :  myKey,
        action : "getContent",
        token: token_
    };

    fetch(endpoint, 
        { 
            redirect: "follow",
            method: 'POST', // Sending a POST request
            headers: {
                'Content-Type': 'text/plain;charset=utf-8', // Specify content type as text
            },
            body: JSON.stringify(contents), // Convert data to JSON string
            }
        ) .then(response => response.json()) // Handle the response
        .then(data => {
            console.log('Success: Notif', data); // Log the response from the server
            if (data.result == "OK" ){

            }else if( data.status == "1"){
                // clear current cookie if there is error and display error message
                document.cookie = "tokenCode =; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
                createNew(container,"p","Error: Something is Wrong. Please try again.",{class:"notif"});
            }else{
                document.cookie = "tokenCode =; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
                createNew(container,"p","Error: Access Expired. Please Login Again.",{class:"notif"});
                setTimeout(function(){
                    container.innerHTML = "";
                    onStart();
                },3000)
            }
        })
        .catch((error) => {
            console.error('Error:', error); // Log any error
        });
}

function RequestCode(){
    const contents = {
        key :  myKey,
        action : "trySendToken"
    };
    sendCode.style.display = "none";
    const notifier = createNew(container,"p","Kode Terkirim");
    const notifier2 = createNew(container,"p","Silakan cek email Admin anda");

    // modify notifier each second for 60s to show countdown after countdown end remove that notifier and set the display of sendCode to Block again
    let count = 60;
    const intervalId = setInterval(() => {
        if (count > 0) {
            notifier.textContent = `Kode Terkirim (${count} detik)`;
            count--;
        } else {
                clearInterval(intervalId);
                sendCode.style.display = "block";
                notifier.remove();
                notifier2.remove();
        }
        }, 1000);

    fetch(endpoint, 
    { 
        redirect: "follow",
        method: 'POST', // Sending a POST request
        headers: {
            'Content-Type': 'text/plain;charset=utf-8', // Specify content type as text
        },
        body: JSON.stringify(contents), // Convert data to JSON string
        }
    ) .then(response => response.json()) // Handle the response
    .then(data => {
        console.log('Success: Notif', data); // Log the response from the server
        
    })
    .catch((error) => {
        console.error('Error:', error); // Log any error
    });
}

function onStart() {
    let tokenCode = getCookie('tokenCode'); // Check if the token cookie exists
    if (!tokenCode) {
        const formSection = createNew(container,"div","",{style:"width:75%"})
        createNew(formSection,"h1","Silahkan Masukan Kode Akses");
        const formKode = createNew(formSection,"form","",{class:"small-form"});        
        createNew(formKode,"label","Akses Kode :",{for:"tokenInput"});
        const nicknameInput = createNew(formKode,"input","",{type:"text",name:"tokenInput", id:"tokenInput"});
        createNew(formKode,"button","Gunakan",{type:"submit"});

        const sendCode_container = createNew(formSection,"div","",{class:"center"});
        sendCode = createNew(sendCode_container,"input","",{value:"Kirim Kode",onclick:"RequestCode()",class:"button",type:"button"});

        formKode.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent page reload
        
        // Get the input value
        token = nicknameInput.value.trim();

        if (token) {
          // Save the token as a cookie
          setCookie('tokenCode', token, 0.00694444); // Save for 10 minutes
          container.innerHTML = ""; //clear content;
        }
      });
    } else {
      token_ = tokenCode;
      tryAccess();
    }
  }

window.onload = () => {
    onStart();
};