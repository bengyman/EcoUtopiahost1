import { Button, Container, Group } from "@mantine/core"

function App() {
  return (
    <Container>
      <h1>Hello, Mantine!</h1>
      <p>Start editing to see some magic happen :)</p>
      <Group>
        <Button color='deepBlue'>Click me</Button>
        <Button color='red'>Click me</Button>
        <Button color='green'>Click me</Button>
      </Group>
    </Container>
  )
}

export default App
