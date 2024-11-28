import {
  Avatar,
  Box,
  Button,
  Flex,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Stack,
  useColorModeValue,
  Text
} from "@chakra-ui/react";
import { ColorModeSwitcher } from "../ColorModeSwitcher";
import { Link as RouterLink } from "react-router-dom";
import { useMeQuery, useUploadProfileImageMutation } from "../../generated/graphql";
import { useMemo } from "react";
import { useLogoutMutation } from "../../generated/graphql";
import { useApolloClient } from "@apollo/client";

const LoggedInNavbarItem = (): JSX.Element => {

  // 로그아웃
  const client = useApolloClient();
  const [logout, { loading: logoutLoading }] = useLogoutMutation();
  async function onLogoutClick() {
    try {
      // 로그아웃 뮤테이션 요청
      await logout();
      // localStorage에서 액세스 토큰 제거
      localStorage.removeItem("access_token");
      // 아폴로 클라이언트 캐시 모두 리셋
      await client.resetStore();
    } catch (e) {
      console.log(e);
    }
  }

  // 파일 업로드
  const [upload] = useUploadProfileImageMutation();
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      console.log("File selected for upload:", file.name, file.size);
      try {
        console.log("Uploading profile image...");
        await upload({
          variables: { file },
          update: (cache) => {
            console.log("Evicting 'me' field from Apollo cache...");
            cache.evict({ fieldName: "me" });
          },
        });
        console.log("Profile image upload successful.");
      } catch (e) {
        console.error("Error during profile image upload:", e);
      }
    }
  }

  const accessToken = localStorage.getItem('access_token');
  console.log("Access token found:", accessToken);

  const { data } = useMeQuery({ skip: !accessToken });
  console.log("Me query result:", data);
  
  // profileImage URL이 data 변경에 의해서만 업데이트되도록 하여 효율적인 렌더링을 보장
  // profileImage에 data?.me?.profileImage 값이 있을 때만 완성된 URL이 할당
  // // console.log(data?.me?.profileImage);
  const profileImage = useMemo(() => {
    console.log("Calculating profile image URL...");
    // data, me, profileImage가 모두 존재할 때만
    if (data?.me?.profileImage) {
      // // 'https://localhost:4000/' + data?.me?.profileImage라는 URL 문자열을 반환하고, 없다면 undefined를 반환
      // const url = `${process.env.REACT_APP_API_HOST}/` + data?.me?.profileImage;
      // console.log("Profile image URL generated:", url);
      // return url;
      const bucketName = "tccmds3";
      const region = "ap-northeast-2";
      const fileKey = data.me.profileImage;

      // 퍼블릭 URL 생성
      return `https://${bucketName}.s3.${region}.amazonaws.com/public/${fileKey}`;
    }
    console.log("No profile image found. Returning empty string.");
    return '';
    // useMemo는 [data] 배열에 의존하여 data가 변경될 때만 함수를 다시 실행
  }, [data]);

  return (
    <Stack justify="flex-end" alignItems="center" direction="row" spacing={3}>
      <ColorModeSwitcher />

      <Menu>
        <MenuButton>
          <Avatar size="sm" src={profileImage} />
        </MenuButton>
        <MenuList minW={300}>
          <Flex px={4} pt={2} pb={4}>
            <label htmlFor="upload-profile-image">
              <input id="upload-profile-image" type="file" accept="image/*" hidden onChange={handleImageUpload} />
              <Avatar size="md" src={profileImage} mr={4} cursor="pointer" />
            </label>
            <Box>
              <Text fontWeight="bold">{data?.me?.username}</Text>
              <Text>{data?.me?.email}</Text>
            </Box>
          </Flex>
          <MenuItem isDisabled={logoutLoading} onClick={onLogoutClick}>
            로그아웃
          </MenuItem>
        </MenuList>
      </Menu>
    </Stack>
  );
};

export default function Navbar(): JSX.Element {
  const accessToken = localStorage.getItem("access_token");
  const { data } = useMeQuery({ skip: !accessToken });
  const isLoggedIn = useMemo(() => {
    if (accessToken) return data?.me?.id;
    return false;
  }, [accessToken, data?.me?.id]);

  return (
    <Box
      zIndex={10}
      position="fixed"
      w="100%"
      bg={useColorModeValue("white", "gray.800")}
      borderBottom={1}
      borderStyle="solid"
      borderColor={useColorModeValue("gray.200", "gray.700")}
      py={{ base: 2 }}
      px={{ base: 4 }}
    >
      <Flex
        maxW={960}
        color={useColorModeValue("gray.600", "white")}
        minH="60px"
        align="center"
        m="auto"
      >
        <Flex flex={{ base: 1, md: "auto" }}>
          <Link
            as={RouterLink}
            to="/"
            fontFamily="heading"
            fontWeight="bold"
            color={useColorModeValue("gray.800", "white")}
          >
            GhibliBestCut
          </Link>
        </Flex>

        {isLoggedIn ? (
          <LoggedInNavbarItem />
        ) : (
          <Stack justify="flex-end" direction="row" spacing={6}>
            <ColorModeSwitcher />
            <Button
              fontSize="sm"
              fontWeight={400}
              variant="link"
              as={RouterLink}
              to="/login"
            >
              로그인
            </Button>
            <Button
              display={{ base: "none", md: "inline-flex" }}
              fontSize="sm"
              fontWeight={600}
              // ref="/signup"
              colorScheme="teal"
              as={RouterLink}
              to="/signup"
            >
              시작하기
            </Button>
          </Stack>
        )}
      </Flex>
    </Box>
  );
}
