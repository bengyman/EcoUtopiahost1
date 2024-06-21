import { AppShell, Flex, Anchor, Button, Image } from "@mantine/core";
import logo from "../assets/logo.png"

function Navbar() {
  return (
    <AppShell header={{ height: 50 }} navbar={{ width: 200, breakpoint: "xl" }}>
      <AppShell.Header style={{ height: 50, backgroundColor: "#0F9D58" }}>
        <Flex align="center" justify="space-between" style={{ height: "100%" }}>
          <Flex align="center">
            <Anchor href="/" style={{ textDecoration: "none" }}>
              <Image src={logo} alt="EcoUtopia" width={70} height={70} />
            </Anchor>
          </Flex>
          <Flex align="center">
            <Anchor href="/login" style={{ textDecoration: "none" }}>
              <Button color="black" style={{ marginLeft: 10, marginRight: 10 }}>
                Login
              </Button>
            </Anchor>
            <Anchor href="/register" style={{ textDecoration: "none" }}>
              <Button color="black" style={{ marginLeft: 10, marginRight: 10 }}>
                Sign Up
              </Button>
            </Anchor>
          </Flex>
        </Flex>
      </AppShell.Header>
    </AppShell>
  );
}

export default Navbar;
