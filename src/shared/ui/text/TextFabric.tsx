import TextVariant, { type TextSemanticVariant } from "./TextVariant";

interface TextFabricProps {
  text: string;
  variant?: TextSemanticVariant;
  id?: number;
  className?: string;
}

const TextFabric = (props: TextFabricProps) => {
  return <TextVariant {...props} />;
};

export default TextFabric;
