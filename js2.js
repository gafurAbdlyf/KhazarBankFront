document.addEventListener("DOMContentLoaded", () => {
  const isPageRefreshed = localStorage.getItem("isPageRefreshed")

  if (!isPageRefreshed) {
    localStorage.setItem("isPageRefreshed", "true")
    window.location.reload()
  } else {
    GetUserBankInfo()
    GetUserTransaction()
  }
  let cardInfo = JSON.parse(localStorage.getItem("cardInfo"))
  const balance = cardInfo.balance
  let transactionHistory = []
  const modal = document.getElementById("operationModal")
  const closeModal = document.querySelector(".close")
  const operationForm = document.getElementById("operationForm")
  const operationFields = document.getElementById("operationFields")
  const modalTitle = document.getElementById("modalTitle")

  function showModal(message) {
    modal.style.display = "block"
    modal.querySelector(".modal-content p").textContent = message
  }

  closeModal.onclick = () => (modal.style.display = "none")
  window.onclick = (e) => {
    if (e.target === modal) modal.style.display = "none"
  }

  function openModal(title, fieldsHTML, callback) {
    modalTitle.textContent = title
    operationFields.innerHTML = fieldsHTML
    modal.style.display = "block"

    document
      .getElementById("submitTopUp")
      ?.removeEventListener("click", callback)

    document
      .getElementById("submitTopUp")
      ?.addEventListener("click", async () => {
        let amount = parseFloat(document.getElementById("amount").value)
        let cardNumber = cardInfo?.cardNumber

        if (!amount || amount <= 0 || !cardNumber) {
          alert("Please enter a valid amount.")
          return
        }

        try {
          const response = await fetch(
            `http://167.172.150.140:8080/api/Operations/TopUpBalance?cardNumber=${cardNumber}&amount=${amount}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          )

          if (response.ok) {
            const result = await response.json()
            GetUserTransaction()
            alert(`Top-up successful!`)
            console.log("Top-Up Result:", result)
          } else {
            const error = await response.json()
            alert(`Top-up failed: ${error.message}`)
          }
        } catch (error) {
          console.error("Error during top-up:", error)
          alert("An error occurred. Please try again.")
        }

        modal.style.display = "none" // Close the modal after completion
      })
    document
      .getElementById("submitTransfer")
      .addEventListener("click", async () => {
        let transferAmount = parseFloat(
          document.getElementById("transferAmount").value
        )
        let recipientCard = document.getElementById("recipientCard").value

        let fromCardNumber = cardInfo?.cardNumber
        console.log(transferAmount, fromCardNumber, recipientCard)

        if (!transferAmount || !recipientCard || !fromCardNumber) {
          alert("Please fill in all fields correctly.")
          return
        }

        try {
          // API call
          const response = await fetch(
            `http://167.172.150.140:8080/api/Operations/CardToCard?fromCardNumber=${fromCardNumber}&toCardNumber=${recipientCard}&amount=${transferAmount}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
            }
          )

          if (response.ok) {
            const result = await response.json()
            alert("Transfer successful!")
            GetUserTransaction()
            console.log("Transfer Result:", result)
          } else {
            const error = await response.json()
            alert(`Transfer failed: ${error.message}`)
          }
        } catch (error) {
          console.error("Error during transfer:", error)
          alert("An error occurred. Please try again.")
        }

        modal.style.display = "none" // Close the modal after completion
      })
  }

  // Top-Up button event listener
  document.getElementById("topUpButton").addEventListener("click", () => {
    openModal(
      "Top-Up Balance",
      `
      <label for="amount">Amount:</label>
      <input type="number" id="amount" required>
      <button id="submitTopUp" type="button" class="btn">Submit</button>
    `
    )
  })

  document
    .getElementById("transferFundsButton")
    .addEventListener("click", () => {
      openModal(
        "Transfer Funds",
        `
      <label for="transferAmount">Amount:</label>
      <input type="number" id="transferAmount" required>
      <label for="recipientCard">Recipient Card:</label>
      <input type="text" id="recipientCard" required>
      <button id="submitTransfer" type="button" class="btn">Submit</button>
    `,
        () => {
          console.log("Callback executed.")
        }
      )
    })

  document.getElementById("makePaymentButton").addEventListener("click", () => {
    openModal(
      "Make Payment",
      `
            <label for="paymentDetails">Payment Details:</label>
            <input type="text" id="paymentDetails" required>
            <label for="paymentAmount">Amount:</label>
            <input type="number" id="paymentAmount" required>
        `,
      () => {
        let paymentAmount = parseFloat(
          document.getElementById("paymentAmount").value
        )
        let paymentDetails = document.getElementById("paymentDetails").value
        if (paymentAmount > 0 && paymentAmount <= balance) {
          balance -= paymentAmount
          transactionHistory.push({
            type: "Payment",
            amount: paymentAmount,
            date: new Date().toLocaleString(),
          })
          showModal(
            `Payment of $${paymentAmount} for ${paymentDetails} successful. New balance: $${balance}`
          )
        } else {
          showModal("Invalid payment details or insufficient balance.")
        }
      }
    )
  })

  document
    .getElementById("checkBalanceButton")
    .addEventListener("click", () => {
      openModal(
        "Balance Check",
        `<p>Your current account balance is $${balance}</p>`,
        () => {
          showModal("Balance check completed.")
        }
      )
    })

  document.getElementById("viewHistoryButton").addEventListener("click", () => {
    openModal("Transaction History", generateHistoryHTML(), () => {
      showModal("Transaction history viewed successfully.")
    })
  })

  function generateHistoryHTML() {
    const transactions = JSON.parse(localStorage.getItem("transactions"))

    if (transactions && transactions.length > 0) {
      return `<form>
              ${transactions
                .map((tx, index) => {
                  const operationDate = new Date(tx.operationDate)
                  const formattedDate = operationDate.toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    }
                  )
                  return `
                    <div>
                        <p><strong>${index + 1}. By:</strong> ${tx.to}</p>
                        <p><strong>Amount:</strong> $${tx.amount}</p>
                        <p><strong>Date:</strong> ${formattedDate}</p>
                    </div>
                    <hr>
                  `
                })
                .join("")}
                
              <button type="submit" class="btn">Close</button>
          </form>`
    } else {
      return `<p>No transactions available.</p>`
    }
  }

  document
    .getElementById("changePasswordForm")
    .addEventListener("submit", (e) => {
      e.preventDefault()
      const currentPassword = document.getElementById("currentPassword").value
      const newPassword = document.getElementById("newPassword").value
      const confirmPassword = document.getElementById("confirmPassword").value

      if (newPassword === confirmPassword) {
        showModal("Password successfully changed!")
        document.getElementById("changePasswordForm").reset()
      } else {
        showModal("New passwords do not match.")
      }
    })
})

async function GetUserBankInfo() {
  try {
    const userId = localStorage.getItem("userId")
    if (!userId) {
      throw new Error("User ID not found in localStorage.")
    }

    const response = await fetch(
      `http://167.172.150.140:8080/api/Operations/GetCardByUserId?userId=${userId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch bank information.")
    }

    const data = await response.json()

    if (data.isSuccess) {
      localStorage.setItem("cardInfo", JSON.stringify(data.card))
      localStorage.setItem("userInfo", JSON.stringify(data.user))
      localStorage.setItem("card", data.card.cardNumber)
    } else {
      throw new Error(data.message || "Operation not successful.")
    }
  } catch (error) {
    console.error("Error fetching bank information:", error)
    alert(`Failed to fetch user bank information. Please try again. ${error}`)
  }
}

async function GetUserTransaction() {
  try {
    // Retrieve cardInfo from localStorage
    const cardInfoString = localStorage.getItem("cardInfo")
    if (!cardInfoString) {
      throw new Error("Card information not found in localStorage.")
    }

    const cardInfo = JSON.parse(cardInfoString)
    console.log("Card Info:", cardInfo)

    // Check if cardNumber exists in cardInfo
    const cardNumber = cardInfo.cardNumber
    if (!cardNumber) {
      throw new Error("Card number is missing in the card information.")
    }

    // Make the API request using the cardNumber
    const response = await fetch(
      `http://167.172.150.140:8080/api/Operations/GetAllTransactions?cardNumber=${cardNumber}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )

    // Handle response status
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(
        errorData.message || "Failed to fetch transaction information."
      )
    }

    const data = await response.json()

    if (data.isSuccess) {
      // Store transactions in localStorage or handle as needed
      localStorage.setItem(
        "transactions",
        JSON.stringify(data.transactions || [])
      )
      console.log("Transaction information stored successfully.")
    } else {
      throw new Error(data.message || "Operation not successful.")
    }
  } catch (error) {
    console.error("Error fetching transaction information:", error)
  }
}
