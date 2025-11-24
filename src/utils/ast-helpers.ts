// Common AST traversal utilities
import { AST_NODE_TYPES, TSESTree } from "@typescript-eslint/utils";

/**
 * Type guard to check if a node is a valid JSX attribute
 */
export function isValidJSXAttribute(
  node: TSESTree.Node
): node is TSESTree.JSXAttribute {
  return (
    node.type === AST_NODE_TYPES.JSXAttribute &&
    node.name.type === AST_NODE_TYPES.JSXIdentifier &&
    node.value !== null
  );
}

/**
 * Type guard to check if a node is a JSX element
 */
export function isJSXElement(node: TSESTree.Node): node is TSESTree.JSXElement {
  return node.type === AST_NODE_TYPES.JSXElement;
}

/**
 * Type guard to check if a node is an identifier
 */
export function isIdentifier(node: TSESTree.Node): node is TSESTree.Identifier {
  return node.type === AST_NODE_TYPES.Identifier;
}

/**
 * Type guard to check if a node is a call expression
 */
export function isCallExpression(
  node: TSESTree.Node
): node is TSESTree.CallExpression {
  return node.type === AST_NODE_TYPES.CallExpression;
}

/**
 * Type guard to check if a node is an export default declaration
 */
export function isExportDefaultDeclaration(
  node: TSESTree.Node
): node is TSESTree.ExportDefaultDeclaration {
  return node.type === AST_NODE_TYPES.ExportDefaultDeclaration;
}

/**
 * Type guard to check if a node is a variable declarator
 */
export function isVariableDeclarator(
  node: TSESTree.Node
): node is TSESTree.VariableDeclarator {
  return node.type === AST_NODE_TYPES.VariableDeclarator;
}

/**
 * Validate JSX element structure
 */
export function validateJSXElement(
  node: TSESTree.Node
): node is TSESTree.JSXElement {
  if (!isJSXElement(node)) {
    return false;
  }
  // Validate opening element has a name
  if (!node.openingElement?.name) {
    return false;
  }
  return true;
}

/**
 * Validate JSX attribute structure
 */
export function validateJSXAttribute(
  node: TSESTree.Node
): node is TSESTree.JSXAttribute {
  if (node.type !== AST_NODE_TYPES.JSXAttribute) {
    return false;
  }
  // Validate attribute has a name
  if (node.name?.type !== AST_NODE_TYPES.JSXIdentifier) {
    return false;
  }
  return true;
}

/**
 * Validate export default declaration structure
 */
export function validateExportDefaultDeclaration(
  node: TSESTree.Node
): node is TSESTree.ExportDefaultDeclaration {
  if (!isExportDefaultDeclaration(node)) {
    return false;
  }
  return true;
}

/**
 * Get the name of a JSX element
 */
export function getJSXElementName(node: TSESTree.JSXElement): string | null {
  const { openingElement } = node;
  if (openingElement.name.type === AST_NODE_TYPES.JSXIdentifier) {
    return openingElement.name.name;
  }
  return null;
}

/**
 * Traverse all child nodes of a given node
 */
export function traverseNode(
  node: TSESTree.Node,
  visitor: (node: TSESTree.Node) => void
): void {
  const visited = new WeakSet<TSESTree.Node>();

  function traverse(currentNode: TSESTree.Node): void {
    if (visited.has(currentNode)) return;
    visited.add(currentNode);

    visitor(currentNode);

    const keys = Object.keys(currentNode) as (keyof TSESTree.Node)[];
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (key === "parent") continue;

      const child = currentNode[key];
      if (!child) continue;
      if (typeof child !== "object") continue;

      if (Array.isArray(child)) {
        for (let j = 0; j < child.length; j++) {
          const item = child[j];
          if (!item || typeof item !== "object") continue;
          if (!("type" in item)) continue;
          traverse(item as unknown as TSESTree.Node);
        }
      } else if ("type" in child) {
        traverse(child as unknown as TSESTree.Node);
      }
    }
  }

  traverse(node);
}

/**
 * Check if a node returns JSX
 */
export function returnsJSX(
  node:
    | TSESTree.FunctionDeclaration
    | TSESTree.ArrowFunctionExpression
    | TSESTree.FunctionExpression
): boolean {
  try {
    const isJSXNode = (n: TSESTree.Node): boolean => {
      return (
        n.type === AST_NODE_TYPES.JSXElement ||
        n.type === AST_NODE_TYPES.JSXFragment
      );
    };

    // For arrow functions with expression body
    if (
      node.type === AST_NODE_TYPES.ArrowFunctionExpression &&
      node.expression &&
      node.body.type !== AST_NODE_TYPES.BlockStatement
    ) {
      return isJSXNode(node.body);
    }

    // For functions with block statement body
    if (node.body && node.body.type === AST_NODE_TYPES.BlockStatement) {
      for (const statement of node.body.body) {
        if (
          statement.type === AST_NODE_TYPES.ReturnStatement &&
          statement.argument
        ) {
          if (isJSXNode(statement.argument)) {
            return true;
          }
        }
      }
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Check if a node is a React component
 */
export function isReactComponent(node: TSESTree.Node): boolean {
  try {
    if (node.type === AST_NODE_TYPES.FunctionDeclaration) {
      return returnsJSX(node);
    }

    if (node.type === AST_NODE_TYPES.VariableDeclarator && node.init) {
      if (
        node.init.type === AST_NODE_TYPES.ArrowFunctionExpression ||
        node.init.type === AST_NODE_TYPES.FunctionExpression
      ) {
        return returnsJSX(node.init);
      }
    }

    if (node.type === AST_NODE_TYPES.ClassDeclaration) {
      if (node.superClass) {
        if (node.superClass.type === AST_NODE_TYPES.MemberExpression) {
          const obj = node.superClass.object;
          const prop = node.superClass.property;
          if (
            obj.type === AST_NODE_TYPES.Identifier &&
            obj.name === "React" &&
            prop.type === AST_NODE_TYPES.Identifier &&
            (prop.name === "Component" || prop.name === "PureComponent")
          ) {
            return true;
          }
        }
        if (node.superClass.type === AST_NODE_TYPES.Identifier) {
          const name = node.superClass.name;
          if (name === "Component" || name === "PureComponent") {
            return true;
          }
        }
      }
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Check if a call expression is a form hook
 */
export function isFormHook(node: TSESTree.CallExpression): boolean {
  try {
    const { callee } = node;

    if (callee.type === AST_NODE_TYPES.Identifier) {
      return callee.name === "useForm" || callee.name === "useFormik";
    }

    if (callee.type === AST_NODE_TYPES.MemberExpression) {
      const prop = callee.property;
      if (prop.type === AST_NODE_TYPES.Identifier) {
        return prop.name === "useForm" || prop.name === "useFormik";
      }
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Check if a property key is a form configuration property
 */
export function isFormConfigProperty(key: string): boolean {
  const formConfigKeys = [
    "defaultValues",
    "schema",
    "resolver",
    "mode",
    "reValidateMode",
    "criteriaMode",
    "shouldFocusError",
    "shouldUnregister",
    "shouldUseNativeValidation",
    "delayError",
    "initialValues",
    "validationSchema",
    "validate",
    "validateOnBlur",
    "validateOnChange",
    "validateOnMount",
  ];
  return formConfigKeys.includes(key);
}

/**
 * Check if a filename matches the service path pattern
 */
export function matchesServicePath(filename: string): boolean {
  try {
    const normalizedPath = filename.replace(/\\/g, "/");
    return normalizedPath.includes("src/services/");
  } catch {
    return false;
  }
}

/**
 * Check if a catch block is effectively empty
 */
export function isEffectivelyEmpty(catchClause: TSESTree.CatchClause): boolean {
  try {
    if (
      !catchClause.body ||
      catchClause.body.type !== AST_NODE_TYPES.BlockStatement
    ) {
      return true;
    }
    return catchClause.body.body.length === 0;
  } catch {
    return true;
  }
}

/**
 * Check if a catch block has an intentional ignore comment
 */
export function hasIntentionalIgnoreComment(
  catchClause: TSESTree.CatchClause,
  sourceCode: { getAllComments?: () => TSESTree.Comment[] }
): boolean {
  try {
    if (
      !catchClause.body ||
      catchClause.body.type !== AST_NODE_TYPES.BlockStatement
    ) {
      return false;
    }

    const allComments =
      typeof sourceCode.getAllComments === "function"
        ? sourceCode.getAllComments()
        : [];

    const catchBlockComments = allComments.filter((comment) => {
      if (!catchClause.range) return false;
      const [start, end] = catchClause.range;
      return (
        comment.range && comment.range[0] >= start && comment.range[1] <= end
      );
    });

    const ignorePatterns = [
      /intentionally\s+ignored?/i,
      /deliberately\s+ignored?/i,
      /ignore\s+error/i,
      /no-op/i,
      /noop/i,
    ];

    return catchBlockComments.some((comment) =>
      ignorePatterns.some((pattern) => pattern.test(comment.value))
    );
  } catch {
    return false;
  }
}

/**
 * React import style enum
 */
export enum ReactImportStyle {
  NAMESPACE = "NAMESPACE",
  DEFAULT_ONLY = "DEFAULT_ONLY",
  NAMED_ONLY = "NAMED_ONLY",
  MIXED = "MIXED",
  NONE = "NONE",
}

export interface ReactImportAnalysis {
  style: ReactImportStyle;
  hasDefaultImport: boolean;
  hasNamedImports: boolean;
  hasMemoImport: boolean;
  importNode: TSESTree.ImportDeclaration | null;
}

/**
 * Analyze React import style in a program
 */
export function analyzeReactImport(
  programNode: TSESTree.Program
): ReactImportAnalysis {
  try {
    let reactImport: TSESTree.ImportDeclaration | null = null;
    for (const statement of programNode.body) {
      if (
        statement.type === AST_NODE_TYPES.ImportDeclaration &&
        statement.source.value === "react"
      ) {
        reactImport = statement;
        break;
      }
    }

    if (!reactImport) {
      return {
        style: ReactImportStyle.NONE,
        hasDefaultImport: false,
        hasNamedImports: false,
        hasMemoImport: false,
        importNode: null,
      };
    }

    let hasDefaultImport = false;
    let hasNamedImports = false;
    let hasNamespaceImport = false;
    let hasMemoImport = false;

    for (const specifier of reactImport.specifiers) {
      if (specifier.type === AST_NODE_TYPES.ImportDefaultSpecifier) {
        hasDefaultImport = true;
      } else if (specifier.type === AST_NODE_TYPES.ImportNamespaceSpecifier) {
        hasNamespaceImport = true;
      } else if (specifier.type === AST_NODE_TYPES.ImportSpecifier) {
        hasNamedImports = true;
        if (
          specifier.imported.type === AST_NODE_TYPES.Identifier &&
          specifier.imported.name === "memo"
        ) {
          hasMemoImport = true;
        }
      }
    }

    let style: ReactImportStyle;
    if (hasNamespaceImport) {
      style = ReactImportStyle.NAMESPACE;
    } else if (hasDefaultImport && hasNamedImports) {
      style = ReactImportStyle.MIXED;
    } else if (hasDefaultImport) {
      style = ReactImportStyle.DEFAULT_ONLY;
    } else if (hasNamedImports) {
      style = ReactImportStyle.NAMED_ONLY;
    } else {
      style = ReactImportStyle.NONE;
    }

    return {
      style,
      hasDefaultImport,
      hasNamedImports,
      hasMemoImport,
      importNode: reactImport,
    };
  } catch {
    return {
      style: ReactImportStyle.NONE,
      hasDefaultImport: false,
      hasNamedImports: false,
      hasMemoImport: false,
      importNode: null,
    };
  }
}

/**
 * Icon environment enum
 */
export enum IconEnvironment {
  REACT_WEB = "REACT_WEB",
  REACT_NATIVE = "REACT_NATIVE",
}

export interface IconEnvironmentDetection {
  environment: IconEnvironment;
  hasReactNativeSvgImport: boolean;
  usesSvgComponent: boolean;
}

/**
 * Detect icon environment (React web vs React Native)
 */
export function detectIconEnvironment(
  programNode: TSESTree.Program,
  svgNode?: TSESTree.JSXElement
): IconEnvironmentDetection {
  try {
    let hasReactNativeSvgImport = false;
    let usesSvgComponent = false;

    for (const statement of programNode.body) {
      if (
        statement.type === AST_NODE_TYPES.ImportDeclaration &&
        statement.source.value === "react-native-svg"
      ) {
        hasReactNativeSvgImport = true;
        break;
      }
    }

    if (svgNode) {
      const elementName = getJSXElementName(svgNode);
      if (elementName === "Svg") {
        usesSvgComponent = true;
      }
    }

    if (!svgNode) {
      traverseNode(programNode, (node) => {
        if (node.type === AST_NODE_TYPES.JSXElement) {
          const elementName = getJSXElementName(node);
          if (elementName === "Svg") {
            usesSvgComponent = true;
          }
        }
      });
    }

    const environment =
      hasReactNativeSvgImport || usesSvgComponent
        ? IconEnvironment.REACT_NATIVE
        : IconEnvironment.REACT_WEB;

    return {
      environment,
      hasReactNativeSvgImport,
      usesSvgComponent,
    };
  } catch {
    return {
      environment: IconEnvironment.REACT_WEB,
      hasReactNativeSvgImport: false,
      usesSvgComponent: false,
    };
  }
}

/**
 * Import update strategy enum
 */
export enum ImportUpdateStrategy {
  NO_UPDATE = "NO_UPDATE",
  ADD_TO_NAMED = "ADD_TO_NAMED",
  ADD_NAMED_TO_DEFAULT = "ADD_NAMED_TO_DEFAULT",
  CREATE_NEW_IMPORT = "CREATE_NEW_IMPORT",
}

export interface MemoStrategy {
  memoReference: string;
  needsMemoImport: boolean;
  importUpdateStrategy: ImportUpdateStrategy;
}

/**
 * Select memo strategy based on React import analysis
 */
export function selectMemoStrategy(
  analysis: ReactImportAnalysis
): MemoStrategy {
  try {
    if (analysis.hasMemoImport) {
      return {
        memoReference: "memo",
        needsMemoImport: false,
        importUpdateStrategy: ImportUpdateStrategy.NO_UPDATE,
      };
    }

    if (analysis.style === ReactImportStyle.NAMESPACE) {
      return {
        memoReference: "React.memo",
        needsMemoImport: false,
        importUpdateStrategy: ImportUpdateStrategy.NO_UPDATE,
      };
    }

    if (analysis.style === ReactImportStyle.DEFAULT_ONLY) {
      return {
        memoReference: "React.memo",
        needsMemoImport: false,
        importUpdateStrategy: ImportUpdateStrategy.NO_UPDATE,
      };
    }

    if (analysis.style === ReactImportStyle.NAMED_ONLY) {
      return {
        memoReference: "memo",
        needsMemoImport: true,
        importUpdateStrategy: ImportUpdateStrategy.ADD_TO_NAMED,
      };
    }

    if (analysis.style === ReactImportStyle.MIXED) {
      return {
        memoReference: "memo",
        needsMemoImport: true,
        importUpdateStrategy: ImportUpdateStrategy.ADD_TO_NAMED,
      };
    }

    return {
      memoReference: "memo",
      needsMemoImport: true,
      importUpdateStrategy: ImportUpdateStrategy.CREATE_NEW_IMPORT,
    };
  } catch {
    return {
      memoReference: "React.memo",
      needsMemoImport: false,
      importUpdateStrategy: ImportUpdateStrategy.NO_UPDATE,
    };
  }
}

export interface ImportFix {
  range: [number, number];
  text: string;
}

export interface ImportUpdateResult {
  fixes: ImportFix[];
  updatedImports: string[];
}

/**
 * Update imports to add memo if needed
 */
export function updateImports(
  strategy: MemoStrategy,
  importNode: TSESTree.ImportDeclaration | null,
  programNode: TSESTree.Program
): ImportUpdateResult {
  try {
    const fixes: ImportFix[] = [];
    const updatedImports: string[] = [];

    if (strategy.importUpdateStrategy === ImportUpdateStrategy.NO_UPDATE) {
      return { fixes, updatedImports };
    }

    if (strategy.importUpdateStrategy === ImportUpdateStrategy.ADD_TO_NAMED) {
      if (!importNode || !importNode.range) {
        return { fixes, updatedImports };
      }

      const namedSpecifiers = importNode.specifiers.filter(
        (spec) => spec.type === AST_NODE_TYPES.ImportSpecifier
      );

      if (namedSpecifiers.length === 0) {
        return { fixes, updatedImports };
      }

      const lastNamedSpecifier = namedSpecifiers[namedSpecifiers.length - 1];
      if (!lastNamedSpecifier.range) {
        return { fixes, updatedImports };
      }

      const insertPosition = lastNamedSpecifier.range[1];
      fixes.push({
        range: [insertPosition, insertPosition],
        text: ", memo",
      });
      updatedImports.push("memo");
    }

    if (
      strategy.importUpdateStrategy ===
      ImportUpdateStrategy.ADD_NAMED_TO_DEFAULT
    ) {
      if (!importNode || !importNode.range) {
        return { fixes, updatedImports };
      }

      const defaultSpecifier = importNode.specifiers.find(
        (spec) => spec.type === AST_NODE_TYPES.ImportDefaultSpecifier
      );

      if (!defaultSpecifier || !defaultSpecifier.range) {
        return { fixes, updatedImports };
      }

      const insertPosition = defaultSpecifier.range[1];
      fixes.push({
        range: [insertPosition, insertPosition],
        text: ", { memo }",
      });
      updatedImports.push("memo");
    }

    if (
      strategy.importUpdateStrategy === ImportUpdateStrategy.CREATE_NEW_IMPORT
    ) {
      const insertPosition = programNode.range ? programNode.range[0] : 0;
      fixes.push({
        range: [insertPosition, insertPosition],
        text: "import { memo } from 'react';\n",
      });
      updatedImports.push("memo");
    }

    return { fixes, updatedImports };
  } catch {
    return { fixes: [], updatedImports: [] };
  }
}

export interface TypeAnnotationStrategy {
  propsType: string;
  needsTypeImport: boolean;
  typeImportSource: string | null;
  needsComponentImport: boolean;
}

/**
 * Get type annotation strategy based on environment and import style
 */
export function getTypeAnnotationStrategy(
  environment: IconEnvironment,
  importStyle: ReactImportStyle
): TypeAnnotationStrategy {
  try {
    if (environment === IconEnvironment.REACT_NATIVE) {
      return {
        propsType: "SvgProps",
        needsTypeImport: true,
        typeImportSource: "react-native-svg",
        needsComponentImport: true,
      };
    }

    if (importStyle === ReactImportStyle.NAMESPACE) {
      return {
        propsType: "React.SVGProps<SVGSVGElement>",
        needsTypeImport: false,
        typeImportSource: null,
        needsComponentImport: false,
      };
    }

    return {
      propsType: "React.SVGProps<SVGSVGElement>",
      needsTypeImport: false,
      typeImportSource: null,
      needsComponentImport: false,
    };
  } catch {
    return {
      propsType: "React.SVGProps<SVGSVGElement>",
      needsTypeImport: false,
      typeImportSource: null,
      needsComponentImport: false,
    };
  }
}

export interface AddTypeAnnotationResult {
  fixes: ImportFix[];
  success: boolean;
}

/**
 * Add type annotation to a component
 */
export function addTypeAnnotation(
  componentNode: TSESTree.Node,
  strategy: TypeAnnotationStrategy,
  programNode: TSESTree.Program
): AddTypeAnnotationResult {
  try {
    const fixes: ImportFix[] = [];

    if (componentNode.type === AST_NODE_TYPES.FunctionDeclaration) {
      const func = componentNode;

      if (func.params.length > 0) {
        const firstParam = func.params[0];

        if (
          firstParam.type === AST_NODE_TYPES.Identifier &&
          firstParam.typeAnnotation
        ) {
          return { fixes: [], success: false };
        }

        if (firstParam.type === AST_NODE_TYPES.Identifier && firstParam.range) {
          const insertPosition = firstParam.range[1];
          fixes.push({
            range: [insertPosition, insertPosition],
            text: `: ${strategy.propsType}`,
          });
        }
      } else {
        if (func.id && func.id.range && func.body.range) {
          const openParenPosition = func.id.range[1];
          fixes.push({
            range: [openParenPosition + 1, openParenPosition + 1],
            text: `props: ${strategy.propsType}`,
          });
        }
      }
    }

    if (componentNode.type === AST_NODE_TYPES.VariableDeclarator) {
      const init = componentNode.init;
      if (init && init.type === AST_NODE_TYPES.ArrowFunctionExpression) {
        const arrowFunc = init;

        if (arrowFunc.params.length > 0) {
          const firstParam = arrowFunc.params[0];

          if (
            firstParam.type === AST_NODE_TYPES.Identifier &&
            firstParam.typeAnnotation
          ) {
            return { fixes: [], success: false };
          }

          if (
            firstParam.type === AST_NODE_TYPES.Identifier &&
            firstParam.range
          ) {
            const insertPosition = firstParam.range[1];
            fixes.push({
              range: [insertPosition, insertPosition],
              text: `: ${strategy.propsType}`,
            });
          }
        }
      }
    }

    if (strategy.needsTypeImport && strategy.typeImportSource) {
      let reactNativeSvgImport: TSESTree.ImportDeclaration | null = null;
      for (const statement of programNode.body) {
        if (
          statement.type === AST_NODE_TYPES.ImportDeclaration &&
          statement.source.value === strategy.typeImportSource
        ) {
          reactNativeSvgImport = statement;
          break;
        }
      }

      if (reactNativeSvgImport) {
        const importedNames = reactNativeSvgImport.specifiers
          .filter(
            (spec): spec is TSESTree.ImportSpecifier =>
              spec.type === AST_NODE_TYPES.ImportSpecifier
          )
          .map((spec) => {
            return spec.imported.type === AST_NODE_TYPES.Identifier
              ? spec.imported.name
              : null;
          })
          .filter((name): name is string => name !== null);

        const needsSvgProps = !importedNames.includes("SvgProps");
        const needsSvg =
          strategy.needsComponentImport && !importedNames.includes("Svg");

        if (needsSvgProps || needsSvg) {
          const namedSpecifiers = reactNativeSvgImport.specifiers.filter(
            (spec) => spec.type === AST_NODE_TYPES.ImportSpecifier
          );

          if (namedSpecifiers.length > 0) {
            const lastSpecifier = namedSpecifiers[namedSpecifiers.length - 1];
            if (lastSpecifier.range) {
              const toAdd: string[] = [];
              if (needsSvgProps) toAdd.push("SvgProps");
              if (needsSvg) toAdd.push("Svg");

              fixes.push({
                range: [lastSpecifier.range[1], lastSpecifier.range[1]],
                text: `, ${toAdd.join(", ")}`,
              });
            }
          }
        }
      } else {
        const toImport = ["SvgProps"];
        if (strategy.needsComponentImport) {
          toImport.push("Svg");
        }

        const insertPosition = programNode.range ? programNode.range[0] : 0;
        fixes.push({
          range: [insertPosition, insertPosition],
          text: `import { ${toImport.join(", ")} } from '${strategy.typeImportSource}';\n`,
        });
      }
    }

    return { fixes, success: fixes.length > 0 };
  } catch {
    return { fixes: [], success: false };
  }
}

/**
 * Validate that a node is a valid call expression with proper structure
 */
export function validateCallExpression(
  node: TSESTree.Node
): node is TSESTree.CallExpression {
  if (!isCallExpression(node)) return false;
  return true;
}
