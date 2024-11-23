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
  useToast,
} from "@chakra-ui/react";
import {
  SignUpMutationVariables,
  useSignUpMutation,
} from "../../generated/graphql";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

// 회원가입 시 입력해야 할 세 입력 필드 이메일, 아이디, 암호를 가지며 submit 타입 버튼을 가지고 있는 입력폼 UI를 구성하고 있다.
// react-hook-form을 사용해 렌더링이 최적화된 form을 구성한다.
function SignUpRealForm() {
  const [signUp, { loading }] = useSignUpMutation();
  // useForm 훅을 사용해 react-hook-form에서 제공하는 상태들을 가져온다.
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpMutationVariables>();
  const navigate = useNavigate();
  const toast = useToast();

  const onSubmit = async (data: SignUpMutationVariables) => {
    const { signUpInput } = data;
    return signUp({ variables: { signUpInput } })
      .then((res) => {
        if (res.data?.signUp) {
          toast({ title: "회원가입을 환영합니다!", status: "success" });
          navigate("/");
        } else {
          toast({
            title: "회원가입 도중 문제가 발생했습니다.",
            status: "error",
          });
        }
      })
      .catch((err) => {
        toast({ title: "이메일 또는 아이디가 중복됩니다.", status: "error" });
        return err;
      });
  };

  return (
    // onSubmit 핸들러로 useForm의 반환값 중 하나은 handleSubmit을 사용
    // 제네릭으로 useForm의 타입을 지정했기 때문에 handleSubmit 함수의 첫번째 인자인 data는 타입이 지정되어있다.
    <Stack as="form" spacing={4} onSubmit={handleSubmit(onSubmit)}>
      {/* isInvaild 속성으로 해당 필드가 유효한지, 유효하지 않은지 구분 */}
      {/* useForm 훅에서 제공된 값인 formState의 errors 값을 통해 구분된다. */}
      {/* 필드의 존재 여부를 !! 연산자를 이용해 boolean값으로 받는다*/}
      <FormControl isInvalid={!!errors.signUpInput?.email}>
        <FormLabel>이메일</FormLabel>
        {/* {...register('signUpInput.필드이름')}을 통해 해당 Input 필드가 react-hook-form에 의해 관리되도록 등록 */}
        <Input
          type="email"
          placeholder="example@example.com"
          {...register("signUpInput.email", {
            required: " 이메일을 입력해주세요.",
            pattern: {
              value:
                /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
              message: "이메일의 형식이 올바르지 않습니다.",
            },
          })}
        />
        {/* formState의 errors의 각 필드값이 있을때만 해당 필드의 에러메세지를 렌더링하도록 구성 */}
        <FormErrorMessage>
          {errors.signUpInput?.email && errors.signUpInput.email.message}
        </FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={!!errors.signUpInput?.username}>
        <FormLabel>아이디</FormLabel>
        <Input
          type="text"
          placeholder="example"
          {...register("signUpInput.username", {
            required: "아이디를 입력해주세요.",
          })}
        />
        <FormErrorMessage>
          {errors.signUpInput?.username && errors.signUpInput.username.message}
        </FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={!!errors.signUpInput?.password}>
        <FormLabel>암호</FormLabel>
        <Input
          type="password"
          placeholder="8자 이상의 영문, 숫자, 특문"
          {...register("signUpInput.password", {
            required: "암호를 입력해주세요.",
            min: { value: 8, message: "비밀번호는 8자 이상이어야 합니다." },
            pattern: {
              value: /^(?=.*[A-za-z])(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/,
              message:
                "암호는 문자, 숫자, 특수 문자를 포함한 8자 이상이어야 합니다.",
            },
          })}
        />
        <FormErrorMessage>
          {errors.signUpInput?.password && errors.signUpInput.password.message}
        </FormErrorMessage>
      </FormControl>

      <Divider />
      <Button color="teal" type="submit" isLoading={loading}>
        계정 생성
      </Button>
    </Stack>
  );
}

export default function SignUpForm(): React.ReactElement {
  return (
    <Stack spacing={8} mx="auto" maxW="lg" py={12} px={6}>
      <Stack align="center">
        <Heading fontSize="4xl">지브리 명장면 프로젝트</Heading>
        <Text fontSize="lg" color="gray.600">
          가입을 환영합니다!
        </Text>
      </Stack>
      <Box
        rounded="lg"
        bg={useColorModeValue("white", "gray.700")}
        boxShadow="lg"
        p={8}
      >
        <SignUpRealForm />
      </Box>
    </Stack>
  );
}
