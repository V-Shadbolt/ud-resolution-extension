export default function errorHandling(error: string) {
    let messaging = ""
    if (error === "UnregisteredDomain") {
        messaging = "Domain is not registered"
    } else if (error === "RecordNotFound") {
        messaging = "Crypto record is not found (or empty)"
    } else if (error === "UnspecifiedResolver") {
        messaging = "Domain is not configured (empty resolver)"
    } else if (error === "UnsupportedDomain") {
        messaging = "Domain is not supported"
    } else {
        messaging = "An unknown issue occured: " + error
    }

    return messaging
}
