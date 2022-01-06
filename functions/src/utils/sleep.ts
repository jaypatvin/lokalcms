const sleep = async (millis) => {
  return new Promise((resolve) => setTimeout(resolve, millis))
}

export default sleep
