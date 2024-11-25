import {
  Box,
  Button,
  Divider,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import {
  LoginMutationVariables,
  useLoginMutation,
} from "../../generated/graphql";
import { useNavigate } from "react-router-dom";

function RealLoginForm(): React.ReactElement {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginMutationVariables>();

  const navigate = useNavigate();
  // useLoginMutation() 훅을 실행해 실제 login 뮤테이션을 요청하는 함수와 loading 상태값을 가져온다.
  const [login, { loading }] = useLoginMutation();

  const onSubmit = async (formData: LoginMutationVariables) => {
    // login 뮤테이션 함수 실행
    const { data } = await login({ variables: formData });
    if (data?.login.errors) {
      // errors 배열을 순회하며 react-hook-form의 setError 함수를 통해 필드 에러를 규정해준다.
      data.login.errors.forEach((err) => {
        // field + err.field 값을 setError 함수의 첫 번째 인자로 사용할 때 발생하는 오류
        // TypeScript의 문자열 리터럴 타입을 엄격하게 체크하는 특성 때문
        // useForm<LoginMutationVariables>()를 사용해 setError의 첫 번째 인자에 허용된 값은 "loginInput.emailOrUsername" 또는 "loginInput.password" 타입만 허용되며, 단순한 string 타입은 허용되지 않는다.
        // setError 인자의 타입을 강제 변환하여 TypeScript에게 허용된 문자열 리터럴 타입으로 알려주는 방식으로 해결
        const field = `loginInput.${err.field}` as
          | "loginInput.emailOrUsername"
          | "loginInput.password";
        setError((field + err.field) as Parameters<typeof setError>[0], {
          message: err.message,
        });
      });
    }
    if (data && data?.login.accessToken) {
      localStorage.setItem("access_token", data.login.accessToken);
      navigate("/");
    }
  };
  return (
    <Box
      rounded="lg"
      bg={useColorModeValue("white", "gray.700")}
      boxShadow="lg"
      p={8}
    >
      <Stack as="form" spacing={4} onSubmit={handleSubmit(onSubmit)}>
        <FormControl isInvalid={!!errors.loginInput?.emailOrUsername}>
          <FormLabel>이메일 또는 아이디</FormLabel>
          <Input
            type="emailOrUsername"
            placeholder="이메일 또는 아이디를 입력하세요."
            {...register("loginInput.emailOrUsername", {
              required: "이메일 또는 아이디를 입력해주세요.",
            })}
          />
          <FormErrorMessage>
            {errors.loginInput?.emailOrUsername &&
              errors.loginInput.emailOrUsername.message}
          </FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.loginInput?.password}>
          <FormLabel>암호</FormLabel>
          <Input
            type="password"
            placeholder="**********"
            {...register("loginInput.password", {
              required: "암호를 입력해주세요.",
            })}
          />
          <FormErrorMessage>
            {errors.loginInput?.password && errors.loginInput.password.message}
          </FormErrorMessage>
        </FormControl>

        <Divider />

        <Button colorScheme="teal" type="submit">
          로그인
        </Button>
      </Stack>
    </Box>
  );
}

function LoginForm(): React.ReactElement {
  return (
    <Stack spacing={8} mx="auto" maxW="lg" py={12} px={6}>
      <Stack align="center">
        <Heading fontSize="4xl">지브리 명장면 프로젝트</Heading>
        <Text fontSize="lg" color="gray.600">
          감상평과 좋아요를 눌러보세요!
        </Text>
      </Stack>

      <RealLoginForm />
    </Stack>
  );
}

export default LoginForm;
