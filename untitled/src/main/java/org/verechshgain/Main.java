package org.verechshgain;

import static com.mongodb.client.model.Filters.eq;

import com.mongodb.client.model.Filters;
import com.mongodb.client.model.Updates;
import com.mongodb.client.result.DeleteResult;
import com.mongodb.client.result.InsertOneResult;
import com.mongodb.client.result.UpdateResult;
import org.bson.Document;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.bson.conversions.Bson;

import java.lang.reflect.Array;
import java.util.ArrayList;
import java.util.Map;
import java.util.Objects;
import java.util.Scanner;
import java.sql.*;


interface database {
    public boolean createRecord(String name, String coordinates, String type, int value);
    public boolean checkForRecord(String name);
    public boolean updateRecord(String name, String coordinates, String type, int value);
    public boolean deleteRecord(String name);
    public String returnRecord(String name);
}
 class mongoDatabase implements database {
    public String uri = "mongodb+srv://rbsmine27_db_user:Lg4rUVa7UPR3Z5Rr@examcluster.qvvrtxy.mongodb.net/";
    public MongoClient mongoClient = MongoClients.create(uri);
    MongoDatabase database = mongoClient.getDatabase("examDatabase");
    MongoCollection<Document> collection = database.getCollection("examCollection");

    public boolean createRecord(String name, String coordinates, String type, int value){
        Document document = new Document().append("name", name).append("coordinates", coordinates).append("type", type).append("value", value);
        InsertOneResult result = collection.insertOne(document);
        return result.wasAcknowledged();

    }

    public boolean checkForRecord(String name){
        Bson query = eq("name", name);
        return collection.countDocuments(query)!=0;
    }

    public boolean updateRecord(String name, String coordinates, String type, int value) {
        if (checkForRecord(name)){
            Bson filter = Filters.eq("name", name);
            Document document = new Document().append("name", name).append("coordinates", coordinates).append("type", type).append("value", value);
            UpdateResult result = collection.replaceOne(filter, document);
            return result.wasAcknowledged();
        }
        else{
            System.out.println("Record with name "+name+" not found");
            return false;
        }
    }
    public boolean deleteRecord(String name){
        Bson filter = Filters.eq("name", name);
        DeleteResult result = collection.deleteOne(filter);
        return result.wasAcknowledged();
    }

    public String returnRecord(String name){
        if (checkForRecord(name)) {
            Bson filter = Filters.eq("name", name);
// Retrieves documents that match the filter and prints them as JSON
            String result = "";
            result = Objects.requireNonNull(collection.find(filter).first()).toJson();
            return result;
        }
        else{
            return "Record with name "+name+" not found";
        }
    }


}
class sqlDatabase implements database {

    String url = "jdbc:postgresql://localhost:5432/test?user=postgres&password=password";
    Connection conn = DriverManager.getConnection(url);

    sqlDatabase() throws SQLException {
    }

    public boolean createRecord(String name, String coordinates, String type, int value) {
        PreparedStatement st;
        try {
            st = conn.prepareStatement("INSERT INTO exam (name, coordinates, type, value) VALUES ($1, $2, $3, $4)");
            st.setString(1, name);
            st.setString(2, coordinates);
            st.setString(3, type);
            st.setInt(4, value);
            int result = st.executeUpdate();
            st.close();
            return true;
        } catch (SQLException e) {
            return false;
        }


    }

    public boolean checkForRecord(String name) {
        PreparedStatement st;
        try {
            st = conn.prepareStatement("count * where name like ?");
            st.setString(1, name);
            ResultSet result = st.executeQuery();
            result.next();
            if (result.getInt(1)!=0){
                result.close();
                st.close();
                return true;
            }
            result.close();
            st.close();
            return false;

        } catch (SQLException e) {
            return false;
        }
    }

    @Override
    public boolean updateRecord(String name, String coordinates, String type, int value) {
        PreparedStatement st;
        try {
            st = conn.prepareStatement("update exam where name like $1 set coordinates=$2, type=$3, value=$4");
            st.setString(1, name);
            st.setString(2, coordinates);
            st.setString(3, type);
            st.setInt(4, value);
            int result = st.executeUpdate();
            st.close();
            return true;

        } catch (SQLException e) {
            return false;
        }
    }


    public boolean deleteRecord(String name) {
        PreparedStatement st;
        try {
            st = conn.prepareStatement("delete * from exam where name like ?");
            st.setString(1, name);
            ResultSet result = st.executeQuery();
            result.next();
            result.close();
            st.close();
            return true;

        } catch (SQLException e) {
            return false;
        }
    }


    public String returnRecord(String name) {
        PreparedStatement st;
        try {
            st = conn.prepareStatement("select * from examwhere name like ?");
            st.setString(1, name);
            ResultSet result = st.executeQuery();
            result.next();
            String  output= result.getString(1);
            result.close();
            st.close();
            return output;

        } catch (SQLException e) {
            return "Database error?";
        }
    }
}
public class Main {
//        static db = new sqlDatabase();
        static mongoDatabase db = new mongoDatabase();
        public static void main(String[] args) {
            System.out.println("Hello.");
            boolean cancel=false;
            while (!cancel) {
                switch (new Scanner(System.in).nextLine()){
                    case "create sensor":{
                        String name;
                        String coordinates;
                        String type;
                        int value;
                        System.out.println("Please enter sensor name: ");
                        name=new Scanner(System.in).nextLine();
                        System.out.println("Please enter sensor coordinates: ");
                        coordinates=new Scanner(System.in).nextLine();
                        System.out.println("Please enter sensor type: ");
                        type=new Scanner(System.in).nextLine();
                        System.out.println("Please enter sensor value: ");
                        value=new Scanner(System.in).nextInt();
                        if (db.createRecord(name, coordinates, type, value)){
                            System.out.println("Success!");
                        }else{System.out.println("Database error");}
                        break;
                    }
                    case "update sensor":{
                        String name;
                        String coordinates;
                        String type;
                        int value;
                        System.out.println("Please enter sensor name: ");
                        name=new Scanner(System.in).nextLine();
                        System.out.println("Please enter sensor coordinates: ");
                        coordinates=new Scanner(System.in).nextLine();
                        System.out.println("Please enter sensor type: ");
                        type=new Scanner(System.in).nextLine();
                        System.out.println("Please enter sensor value: ");
                        value=new Scanner(System.in).nextInt();
                        if (db.updateRecord(name, coordinates, type, value)){
                            System.out.println("Success!");
                        }else{System.out.println("Database error");}
                        break;
                    }

                    case "delete sensor":{
                        String name;
                        System.out.println("Please enter user name: ");
                        name=new Scanner(System.in).nextLine();
                        if (db.deleteRecord(name)){
                            System.out.println("Success!");
                        }else{System.out.println("Database error");}
                        break;
                    }


                    case "cancel": {
                        cancel = true;
                        break;
                    }
                    case "view sensor": {
                        String name;
                        System.out.println("Please enter sensor name: ");
                        name=new Scanner(System.in).nextLine();
                        System.out.println(db.returnRecord(name));
                        break;
                    }
                    default: {
                        System.out.println("Invalid input");
                        break;
                    }
                }
            }
        }
    }

