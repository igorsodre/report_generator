package ComplexityCalculator;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;

import com.github.javaparser.StaticJavaParser;
import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.ast.body.FieldDeclaration;
import com.github.javaparser.ast.expr.VariableDeclarationExpr;

/**
 * App!
 *
 */
public class App {
    public String testfieldDecl;

    public static void main(String[] args) throws IOException {
        String testFileString = Files.readString(Paths.get("./javaComplexityCalculator/src/examples/example.txt"),
                StandardCharsets.UTF_8);

        CompilationUnit compilationUnit = StaticJavaParser.parse(testFileString);
        System.out.println("Teste1");
        compilationUnit.findAll(VariableDeclarationExpr.class).stream().forEach(f -> {
            System.out.println(f.toString());
        });
        System.out.println("=============================================");
        System.out.println("Teste2");
        compilationUnit.findAll(FieldDeclaration.class).stream().forEach(f -> {
            System.out.println(f.toString());
        });
    }
}
