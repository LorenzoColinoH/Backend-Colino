
const login = async (username, password) => {
    const request = await fetch("http://localhost:3000/login", {
        method: "POST",
        body: JSON.stringify({
            username: username,
            password: password
        }),
        // Se pueden mandar cookies
        credentials: "include",
        // Formato JSON
        headers: {
            'Content-Type': 'application/json'
        }
    })
}

const inputUsername = document.getElementById("input-username")
const inputPassword = document.getElementById("input-password")
const submitButton = document.getElementById("submit")

submitButton.addEventListener("click", () => {
    const username = inputUsername.value;
    const password = inputPassword.value;
    console.log(username,password)
    login(username,password)

});