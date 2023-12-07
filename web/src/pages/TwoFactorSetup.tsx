import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  useSetupTwoFactorAuthMutation,
  useVerifyTwoFactorTokenMutation,
  useMeQuery,
} from "../generated/graphql";
import { withApollo } from "../util/withApollo";
import {
  Box,
  Heading,
  Text,
  Image,
  Input,
  Button,
  Flex,
  Center,
  useToast
} from "@chakra-ui/react";
import { useIsAuth } from "../util/useIsAuth";

const TwoFactorSetup = () => {
  useIsAuth();
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [setupTwoFactorAuth] = useSetupTwoFactorAuthMutation();
  const [verifyTwoFactorToken] = useVerifyTwoFactorTokenMutation();
  const { data: meData } = useMeQuery(); // Fetch current user data
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    if (!meData?.me?.isTwoFactorEnabled) {
      // User hasn't set up 2FA, generate QR code
      const setup2FA = async () => {
        const response = await setupTwoFactorAuth();
        if (response.data && response.data.setupTwoFactorAuth) {
          setQrCodeUrl(response.data.setupTwoFactorAuth);
        }
      };
      setup2FA();
    }
  }, [setupTwoFactorAuth, meData]);

  const handleVerifyCode = async () => {
    try {
      const response = await verifyTwoFactorToken({
        variables: {
          token: twoFactorCode,
        },
      });

      if (response.data?.verifyTwoFactorToken) {
        // Code is correct, redirect to home page
        router.push("/");
      } else {
        // Handle error (code is incorrect)
        console.log("Incorrect 2FA code");
        toast({
          title: "Error",
          description: "Incorrect 2FA code",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "top",
        });

      }
    } catch (error) {
      console.error("Error verifying 2FA code", error);
    }
  };

  return (
    <Flex align="center" justify="center" h="100vh">
      <Box maxW="md" p={8} borderWidth={1} borderRadius="md" boxShadow="lg">
        <Heading as="h1" size="xl" mb={4}>
          Two-Factor Authentication
        </Heading>

        {!meData?.me?.isTwoFactorEnabled && qrCodeUrl && (
          <Center mb={4}>
            <Box>
              <Text mb={2}>
                Scan this QR code with your Google Authenticator app:
              </Text>
              <Image src={qrCodeUrl} alt="Two-Factor Authentication QR Code" />
            </Box>
          </Center>
        )}

        <Box>
          <Input
            type="text"
            value={twoFactorCode}
            onChange={(e) => setTwoFactorCode(e.target.value)}
            placeholder="Enter 2FA code"
            mb={2}
          />
          <Button
            onClick={handleVerifyCode}
            colorScheme="teal"
            variant="solid"
            _hover={{ bg: "teal.500" }}
          >
            Verify Code
          </Button>
        </Box>
      </Box>
    </Flex>
  );
};

export default withApollo({ ssr: false })(TwoFactorSetup);
