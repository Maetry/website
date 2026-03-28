"use client";

import type { ReactNode } from "react";

import { Box, Flex, Text } from "@chakra-ui/react";

interface BentoBoxProps {
  icon: ReactNode;
  title: string;
  problems: string[];
  solutions: string[];
  benefits: string[];
  labels: {
    problem: string;
    solution: string;
    benefit: string;
  };
  size?: "small" | "medium" | "large" | "wide";
}

function ListRow({ children }: { children: React.ReactNode }) {
  return (
    <Flex
      as="li"
      align="flex-start"
      gap={2}
      fontSize="sm"
      lineHeight={1.55}
      color="marketing.fgMuted"
    >
      <Box
        mt="0.45em"
        w="1.5"
        h="1.5"
        rounded="full"
        bg="marketing.fgSubtle"
        flexShrink={0}
      />
      <Box>{children}</Box>
    </Flex>
  );
}

const sectionLabel = {
  fontSize: "xs",
  fontWeight: "semibold",
  textTransform: "uppercase",
  letterSpacing: "0.14em",
  color: "marketing.fgSubtle",
  mb: 2,
} as const;

const BentoBox = ({
  icon,
  title,
  problems,
  solutions,
  benefits,
  labels,
  size = "medium",
}: BentoBoxProps) => {
  return (
    <Box
      h="full"
      display="flex"
      flexDirection="column"
      rounded="2xl"
      borderWidth="1px"
      borderColor="marketing.border"
      bg="marketing.surface"
      p={6}
      transition="border-color 0.2s ease"
      _hover={{
        borderColor: { base: "rgba(19,19,26,0.14)", _dark: "rgba(255,255,255,0.14)" },
      }}
    >
      <Flex align="center" gap={3} mb={4}>
        <Flex
          align="center"
          justify="center"
          h={11}
          w={11}
          flexShrink={0}
          rounded="lg"
          borderWidth="2px"
          borderColor="marketing.accent"
          color="marketing.accent"
        >
          {icon}
        </Flex>
        <Text
          as="h3"
          fontSize={{ base: "md", sm: "lg" }}
          fontWeight="semibold"
          color="marketing.fg"
          lineHeight={1.25}
        >
          {title}
        </Text>
      </Flex>

      {size === "small" && (
        <Box>
          <Text {...sectionLabel}>{labels.problem}</Text>
          <Text fontSize="sm" lineHeight={1.6} color="marketing.fgMuted" lineClamp={2}>
            {problems[0]}
          </Text>
        </Box>
      )}

      {size === "medium" && (
        <Flex direction="column" gap={4} flex={1}>
          <Box>
            <Text {...sectionLabel}>{labels.problem}</Text>
            <Box
              as="ul"
              listStyleType="none"
              pl={0}
              m={0}
              display="flex"
              flexDirection="column"
              gap={1}
            >
              {problems.slice(0, 2).map((problem, index) => (
                <ListRow key={index}>{problem}</ListRow>
              ))}
            </Box>
          </Box>
          <Box>
            <Text {...sectionLabel}>{labels.solution}</Text>
            <Box
              as="ul"
              listStyleType="none"
              pl={0}
              m={0}
              display="flex"
              flexDirection="column"
              gap={1}
            >
              {solutions.slice(0, 2).map((solution, index) => (
                <ListRow key={index}>{solution}</ListRow>
              ))}
            </Box>
          </Box>
        </Flex>
      )}

      {(size === "large" || size === "wide") && (
        <Flex direction="column" gap={4} flex={1}>
          <Box>
            <Text {...sectionLabel} mb={3}>
              {labels.problem}
            </Text>
            <Box
              as="ul"
              listStyleType="none"
              pl={0}
              m={0}
              display="flex"
              flexDirection="column"
              gap={2}
            >
              {problems.map((problem, index) => (
                <ListRow key={index}>{problem}</ListRow>
              ))}
            </Box>
          </Box>
          <Box>
            <Text {...sectionLabel} mb={3}>
              {labels.solution}
            </Text>
            <Box
              as="ul"
              listStyleType="none"
              pl={0}
              m={0}
              display="flex"
              flexDirection="column"
              gap={2}
            >
              {solutions.map((solution, index) => (
                <ListRow key={index}>{solution}</ListRow>
              ))}
            </Box>
          </Box>
          <Box>
            <Text {...sectionLabel} mb={3}>
              {labels.benefit}
            </Text>
            <Box
              as="ul"
              listStyleType="none"
              pl={0}
              m={0}
              display="flex"
              flexDirection="column"
              gap={2}
            >
              {benefits.map((benefit, index) => (
                <ListRow key={index}>{benefit}</ListRow>
              ))}
            </Box>
          </Box>
        </Flex>
      )}
    </Box>
  );
};

export default BentoBox;
