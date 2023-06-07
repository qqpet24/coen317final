import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DatabaseConnection {
    public static void main(String[] args) {
        try {
            Class.forName("oracle.jdbc.driver.OracleDriver");
            // Load the Oracle JDBC driver
            // Establish the connection
            String url = "jdbc:oracle:thin:@db.engr.scu.edu:1521:db11g";
            String username = "nliang";
            String password = "12345Jxtsz";
            Connection connection = DriverManager.getConnection(url, username, password);

            // Use the connection for database operations

            // Close the connection
            connection.close();
        } catch (ClassNotFoundException e) {
            System.out.println("Oracle JDBC driver not found.");
            e.printStackTrace();
        } catch (SQLException e) {
            System.out.println("Error occurred while connecting to the database.");
            e.printStackTrace();
        }
    }
}
