document.addEventListener("DOMContentLoaded", function () {
  const password = document.getElementById("registerPassword")
  const rePassword = document.getElementById("rePassword")
  const passwordMismatchError = document.getElementById("passwordMismatchError")

  function checkPasswordsMatch() {
    if (password.value && rePassword.value) {
      if (password.value !== rePassword.value) {
        passwordMismatchError.style.display = "block"
      } else {
        passwordMismatchError.style.display = "none"
      }
    } else {
      passwordMismatchError.style.display = "none"
    }
  }

  password.addEventListener("input", checkPasswordsMatch)
  rePassword.addEventListener("input", checkPasswordsMatch)

  const form = document.querySelector("form")
  form.addEventListener("submit", function (event) {
    if (password.value !== rePassword.value) {
      event.preventDefault()
      passwordMismatchError.style.display = "block"
    }
  })
})

function showLogin() {
  document.getElementById("login").style.display = "block"
  document.getElementById("forgotPasswordForm").style.display = "none"
  document.getElementById("register").style.display = "none"
}

function showRegister() {
  document.getElementById("login").style.display = "none"
  document.getElementById("register").style.display = "block"
  document.getElementById("forgotPasswordForm").style.display = "none"
}

function forgotPassword() {
  document.getElementById("login").style.display = "none"
  document.getElementById("forgotPasswordForm").style.display = "block"
}

function myMenuFunction() {
  const navMenu = document.getElementById("navMenu")
  if (navMenu.className === "nav-menu") {
    navMenu.className += " responsive"
  } else {
    navMenu.className = "nav-menu"
  }
}

function showNotification(message) {
  const notification = document.getElementById("notification")
  notification.textContent = message
  notification.style.opacity = 1
  setTimeout(() => {
    notification.style.opacity = 0
  }, 3000)
}

async function handleLogin() {
  const email = document.getElementById("loginEmail").value
  const password = document.getElementById("loginPassword").value

  if (!email || !password) {
    showNotification("Please fill in all fields.")
    return
  }

  const loginButton = document.querySelector(".submit")
  loginButton.style.transform = "scale(1.1)"

  setTimeout(() => {
    loginButton.style.transform = "scale(1)"
  }, 200)

  try {
    const response = await fetch(
      "http://167.172.150.140:8080/api/Auth/SignIn",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      showNotification(errorData.message || "Invalid credentials.")
      return
    }

    const data = await response.json()
    localStorage.setItem("userId", data.currentUser.userId)
    window.location.href = "home.html"
  } catch (error) {
    showNotification("Something went wrong. Please try again.")
    console.error("Error during login:", error)
  }
}

async function handleRegister() {
  const signupData = {
    firstName: document.getElementById("firstName").value,
    lastName: document.getElementById("lastName").value,
    email: document.getElementById("registerEmail").value,
    password: document.getElementById("registerPassword").value,
    rePassword: document.getElementById("rePassword").value,
    phoneNumber: document.getElementById("registerNumber").value,
    finCode: document.getElementById("registerFin").value,
  }

  if (
    !signupData.firstName ||
    !signupData.lastName ||
    !signupData.email ||
    !signupData.password ||
    !signupData.rePassword ||
    !signupData.phoneNumber ||
    !signupData.finCode
  ) {
    showNotification("Please fill in all fields.")
    return
  }

  if (signupData.password !== signupData.rePassword) {
    showNotification("Passwords do not match. Please try again.")
    return
  }

  try {
    const response = await fetch(
      "http://167.172.150.140:8080/api/Auth/SignUp",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signupData),
      }
    )
    if (!response.ok) {
      const errorData = await response.json()
      showNotification(
        errorData.message || "Registration failed. Please try again."
      )
      return
    }
    const data = await response.json()
    const pashHash = data.currentUser.passHash
    localStorage.setItem("pashHash", pashHash)
    localStorage.setItem("signupData", JSON.stringify(signupData))
    window.location.href = "verification.html"
  } catch (error) {
    showNotification("An error occurred. Please try again later.")
    console.error("Registration error:", error)
  }
}

async function handleForgotPassword() {
  const email = document.getElementById("forgotEmail").value

  if (!email) {
    showNotification("Please enter your email address.")
    return
  }

  try {
    const response = await fetch(
      `http://167.172.150.140:8080/api/Auth/ForgetPassword?email=${email}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )

    if (response.ok) {
      const data = await response.json()

      if (data.isSuccess) {
        const userId = data.currentUser.userId
        if (userId) {
          localStorage.setItem("userId", userId)

          window.location.href = "forgetVerification.html"
        } else {
          showNotification("User ID not found in the response.")
        }
      } else {
        showNotification(`Error: ${data.message}`)
      }
    } else {
      const errorData = await response.json()
      showNotification(`Error: ${errorData.message || "An error occurred."}`)
    }
  } catch (error) {
    console.error("Error during password reset request:", error)
    showNotification("An error occurred. Please try again later.")
  }
}

document.querySelectorAll(".input-box i").forEach((icon) => {
  icon.style.left = "10px"
})

document.querySelectorAll(".input-box input").forEach((input) => {
  input.style.paddingLeft = "40px"
})
function openModal() {
  document.getElementById("termsModal").style.display = "block"
}

function closeModal() {
  document.getElementById("termsModal").style.display = "none"
}

window.onclick = function (event) {
  const modal = document.getElementById("termsModal")
  if (event.target === modal) {
    modal.style.display = "none"
  }
}
