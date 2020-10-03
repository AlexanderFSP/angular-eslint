import {
  createESLintRule,
  getTemplateParserServices,
} from '../utils/create-eslint-rule';

type Options = [];
export type MessageIds = 'altText';
export const RULE_NAME = 'alt-text';

const DEFAULT_ELEMENTS = ['img', 'object', 'area', 'input[type="image"]'];

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: `Enforces alternate text for elements which require the alt, aria-label, aria-labelledby attributes`,
      category: 'Best Practices',
      recommended: false,
    },
    schema: [],
    messages: {
      altText: '{{name}} element must have a text alternative',
    },
  },
  defaultOptions: [],
  create(context) {
    const hasAttr = (node: any, prop: string) =>
      node.attributes.find(({ name }: any) => name === prop);

    const hasInput = (node: any, prop: string) =>
      node.inputs.find(({ name }: any) => name === prop);

    const hasAttrOrInput = (node: any, prop: string) =>
      hasAttr(node, prop) || hasInput(node, prop);

    const isValid = (node: any): boolean => {
      const { name } = node;

      switch (name) {
        case 'img':
          return hasAttrOrInput(node, 'alt') || hasAttr(node, 'attr.alt');

        default:
          return true;
      }
    };

    const typesToValidate = DEFAULT_ELEMENTS.map((type) =>
      type === 'input[type="image"]' ? 'input' : type,
    );

    const parserServices = getTemplateParserServices(context);

    return parserServices.defineTemplateBodyVisitor({
      Element(node: any) {
        const { name } = node;
        if (typesToValidate.includes(name) && !isValid(node)) {
          const loc = parserServices.convertNodeSourceSpanToLoc(
            node.startSourceSpan,
          );
          context.report({
            messageId: 'altText',
            loc,
            data: {
              name,
            },
          });
        }
      },
    });
  },
});
