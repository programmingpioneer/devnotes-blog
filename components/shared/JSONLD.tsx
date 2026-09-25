type JSONLDProps = {
  data: Record<string, unknown> | Record<string, unknown>[];
};

export default function JSONLD({ data }: JSONLDProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}