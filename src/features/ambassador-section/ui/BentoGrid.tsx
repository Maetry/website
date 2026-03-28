"use client";

import type { ReactNode } from "react";
import { useMemo } from "react";

import { Box, Container, Grid, GridItem, Heading, Text, VStack } from "@chakra-ui/react";
import {
  Building2,
  Calendar,
  Clock,
  MessageCircle,
  Smartphone,
  Sparkles,
  Store,
  UserCircle2,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";

import BentoBox from "./BentoBox";

const iconProps = { size: 22, strokeWidth: 1.75 as const, "aria-hidden": true as const };

interface Feature {
  icon: ReactNode;
  title: string;
  problems: string[];
  solutions: string[];
  benefits: string[];
  size?: "small" | "medium" | "large" | "wide";
}

function gridSpans(size?: Feature["size"]) {
  switch (size ?? "medium") {
    case "small":
      return {
        colSpan: { base: 1, md: 1, lg: 1 },
        rowSpan: { base: 1, md: 1, lg: 1 },
      };
    case "medium":
      return {
        colSpan: { base: 1, md: 1, lg: 1 },
        rowSpan: { base: 1, md: 2, lg: 2 },
      };
    case "large":
      return {
        colSpan: { base: 1, md: 2, lg: 2 },
        rowSpan: { base: 1, md: 2, lg: 2 },
      };
    case "wide":
      return {
        colSpan: { base: 1, md: 2, lg: 2 },
        rowSpan: { base: 1, md: 1, lg: 1 },
      };
    default:
      return { colSpan: 1, rowSpan: 1 };
  }
}

const BentoGrid = () => {
  const t = useTranslations("ambassador");

  const labels = useMemo(
    () => ({
      problem: t("labels.problem"),
      solution: t("labels.solution"),
      benefit: t("labels.benefit"),
    }),
    [t],
  );

  const features: Feature[] = useMemo(
    () => [
      {
        icon: <Calendar {...iconProps} />,
        title: t("features.appointments.title"),
        problems: t.raw("features.appointments.problems") as string[],
        solutions: t.raw("features.appointments.solutions") as string[],
        benefits: t.raw("features.appointments.benefits") as string[],
        size: "large",
      },
      {
        icon: <Clock {...iconProps} />,
        title: t("features.schedule.title"),
        problems: t.raw("features.schedule.problems") as string[],
        solutions: t.raw("features.schedule.solutions") as string[],
        benefits: t.raw("features.schedule.benefits") as string[],
        size: "medium",
      },
      {
        icon: <Sparkles {...iconProps} />,
        title: t("features.services.title"),
        problems: t.raw("features.services.problems") as string[],
        solutions: t.raw("features.services.solutions") as string[],
        benefits: t.raw("features.services.benefits") as string[],
        size: "medium",
      },
      {
        icon: <Users {...iconProps} />,
        title: t("features.clients.title"),
        problems: t.raw("features.clients.problems") as string[],
        solutions: t.raw("features.clients.solutions") as string[],
        benefits: t.raw("features.clients.benefits") as string[],
        size: "wide",
      },
      {
        icon: <UserCircle2 {...iconProps} />,
        title: t("features.employees.title"),
        problems: t.raw("features.employees.problems") as string[],
        solutions: t.raw("features.employees.solutions") as string[],
        benefits: t.raw("features.employees.benefits") as string[],
        size: "small",
      },
      {
        icon: <Store {...iconProps} />,
        title: t("features.salon.title"),
        problems: t.raw("features.salon.problems") as string[],
        solutions: t.raw("features.salon.solutions") as string[],
        benefits: t.raw("features.salon.benefits") as string[],
        size: "small",
      },
      {
        icon: <Smartphone {...iconProps} />,
        title: t("features.attraction.title"),
        problems: t.raw("features.attraction.problems") as string[],
        solutions: t.raw("features.attraction.solutions") as string[],
        benefits: t.raw("features.attraction.benefits") as string[],
        size: "medium",
      },
      {
        icon: <Building2 {...iconProps} />,
        title: t("features.workspaces.title"),
        problems: t.raw("features.workspaces.problems") as string[],
        solutions: t.raw("features.workspaces.solutions") as string[],
        benefits: t.raw("features.workspaces.benefits") as string[],
        size: "medium",
      },
      {
        icon: <MessageCircle {...iconProps} />,
        title: t("features.support.title"),
        problems: t.raw("features.support.problems") as string[],
        solutions: t.raw("features.support.solutions") as string[],
        benefits: t.raw("features.support.benefits") as string[],
        size: "wide",
      },
    ],
    [t],
  );

  return (
    <Box
      as="section"
      id="partner-proof"
      py={{ base: 12, lg: 16 }}
      bg={{ base: "white", _dark: "#0b0d12" }}
    >
      <Container maxW="7xl" px={{ base: 4, sm: 6, lg: 8 }}>
        <VStack gap={4} textAlign="center" maxW="3xl" mx="auto" mb={10}>
          <Heading
            as="h2"
            fontSize={{ base: "3xl", sm: "4xl" }}
            fontWeight="semibold"
            letterSpacing="-0.04em"
            color="marketing.fg"
            lineHeight={1.15}
          >
            {t("gridTitle")}{" "}
            <Box as="span" color="marketing.accent">
              Maetry
            </Box>
          </Heading>
          <Text fontSize="base" lineHeight={1.75} color="marketing.fgMuted">
            {t("gridDescription")}
          </Text>
        </VStack>

        <Grid
          w="full"
          templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }}
          gap={5}
          autoRows="minmax(140px, auto)"
        >
          {features.map((feature, index) => (
            <GridItem key={index} {...gridSpans(feature.size)}>
              <BentoBox
                icon={feature.icon}
                title={feature.title}
                problems={feature.problems}
                solutions={feature.solutions}
                benefits={feature.benefits}
                labels={labels}
                size={feature.size}
              />
            </GridItem>
          ))}
        </Grid>

        <Text mt={10} textAlign="center" fontSize="sm" color="marketing.fgSubtle">
          {t("gridHint")}
        </Text>
      </Container>
    </Box>
  );
};

export default BentoGrid;
