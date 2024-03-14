import parser from "@babel/parser";
import generate from "@babel/generator";
import t from "@babel/types";
import path from "path";
import fs from "fs";
import { namedTypes, builders as b } from "ast-types";
import { getValue } from "./ast";
import { safeParse } from "./json";

const componentsDirectoryPath = path.resolve(__dirname, "../../app/src");
const componentsDirectory = fs.readdirSync(componentsDirectoryPath);

for (const file of componentsDirectory) {
  const filePath = path.resolve(componentsDirectoryPath, file);
  const resultPath = filePath.replace("/app/", "/design/");
  const content = fs.readFileSync(filePath).toString("utf-8");
  const ast = parser.parse(content, {
    sourceType: "module",
    sourceFilename: filePath,
    tokens: true,
    plugins: ["jsx", "typescript", "optionalChaining"],
  });
  const statemets: namedTypes.Program["body"] = [];
  for (const declaration of ast.program.body) {
    if (
      namedTypes.TSInterfaceDeclaration.check(declaration) &&
      namedTypes.Identifier.check(declaration.id) &&
      declaration.id.name.endsWith("Props")
    ) {
      const objectProperties = b.objectExpression([]);
      const objectDeclaration = b.variableDeclaration("const", [
        b.variableDeclarator(
          b.identifier(declaration.id.name),
          objectProperties
        ),
      ]);
      statemets.push(objectDeclaration);
      for (const interfaceProperty of declaration.body.body) {
        if (
          namedTypes.TSPropertySignature.check(interfaceProperty) &&
          !namedTypes.TSFunctionType.check(
            interfaceProperty.typeAnnotation?.typeAnnotation
          ) &&
          namedTypes.Identifier.check(interfaceProperty.key)
        ) {
          const properties = [
            b.objectProperty(
              b.identifier("value"),
              getValue(interfaceProperty.typeAnnotation?.typeAnnotation)
            ),
          ];
          if (interfaceProperty.trailingComments) {
            const comments = interfaceProperty.trailingComments?.map(
              (trailingComment) => safeParse(trailingComment.value)
            );
            for (const comment of comments) {
              if (comment.ok) {
                for (const key of Object.keys(comment.object)) {
                  properties.push(
                    b.objectProperty(
                      b.identifier(key),
                      b.stringLiteral(comment.object[key] as string)
                    )
                  );
                }
              }
            }
          }
          objectProperties.properties.push(
            b.objectProperty(
              b.identifier(interfaceProperty.key.name),
              b.objectExpression(properties)
            )
          );
        }
      }
    }
  }
  const { code } = generate(b.file(b.program(statemets)) as t.Node);
  fs.writeFileSync(resultPath, code);
}
