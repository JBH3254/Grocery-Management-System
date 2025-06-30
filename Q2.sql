/*tesk 1*/
DROP PROCEDURE IF EXISTS GenerateFamilyRelationsSingleJoinCombinedCase;
DROP TABLE IF EXISTS Family_Relations;
DROP TABLE IF EXISTS peple;

CREATE TABLE peple(
Person_Id int PRIMARY KEY,
Personal_Name CHAR (20),	
Family_Name CHAR(20),
Gender CHAR (1),
Father_Id int,
Mother_Id int,
Spouse_Id int
);

INSERT INTO peple VALUES(325461069,'Chany','Acker','F',123456789,987654321,213334386);
INSERT INTO peple VALUES(213334386,'Yshi','Acker','M',333333333,444444444,325461069);
INSERT INTO peple VALUES(240389890,'Miri','Acker','F',213334386,325461069, NULL);
INSERT INTO peple VALUES(241679976,'Peri','Acker','F',213334386,325461069, null);
INSERT INTO peple VALUES(555555555,'Bruchi','Zalzman','F',123456789,987654321,666666666);
INSERT INTO peple VALUES(666666666,'Muti','Zalzman','M',879456212,988741203,null);
INSERT INTO peple VALUES(999999999,'Yudit','Shwadron','F',123456789,987654321,888888888);
INSERT INTO peple VALUES(888888888,'Yuchonon','Shwadron','M',101010101,202020020,999999999);
INSERT INTO peple VALUES(303030330,'Shloimi','Shwadron','M',888888888,999999999, null);
INSERT INTO peple VALUES(777777777,'Aron','Shor','M',123456789,987654321,404040404);
INSERT INTO peple VALUES(123456789,'Baruch','Shor','M',545454545,787878787,987654321);
INSERT INTO peple VALUES(258258285,'Sheina','Acker','F',333333333,444444444,null);
INSERT INTO peple VALUES(797979797,'Sluno','Segal','M',003230033,112112112,258258285);
INSERT INTO peple VALUES(404040404,'Hinda','Shor','F',836393863,045045045,null);

/*tesk 2*/
DELIMITER //

CREATE PROCEDURE GenerateFamilyRelationsSingleJoinCombinedCase()
BEGIN
    CREATE TABLE Family_Relations (
        Person_Id INT,
        Relative_Id INT,
        Connection_Type CHAR(10),
        FOREIGN KEY (Person_Id) REFERENCES peple(Person_Id),
        PRIMARY KEY (Person_Id, Relative_Id)
    );

    INSERT INTO Family_Relations (Person_Id, Relative_Id, Connection_Type)
    SELECT Person_Id, Father_Id, 'Father'
    FROM peple;

    INSERT INTO Family_Relations (Person_Id, Relative_Id, Connection_Type)
    SELECT Person_Id, Mother_Id, 'Mother'
    FROM peple;

    INSERT INTO Family_Relations (Person_Id, Relative_Id, Connection_Type)
    SELECT Person_Id, Spouse_Id,
        CASE Gender
                    WHEN 'M' THEN 'Wife'
                    WHEN 'F' THEN 'Husband'
                    ELSE NULL
        END AS Connection_Type
    FROM peple
    where Spouse_Id IS NOT NULL;

    INSERT INTO Family_Relations (Person_Id, Relative_Id, Connection_Type)
    SELECT
        p1.Person_Id,
        CASE
            WHEN p1.Person_Id = p2.Father_Id THEN p2.Person_Id 
            WHEN p1.Person_Id = p2.Mother_Id THEN p2.Person_Id 
            WHEN p1.Father_Id = p2.Father_Id THEN p2.Person_Id
            WHEN p1.Mother_Id = p2.Mother_Id THEN p2.Person_Id
            ELSE NULL
        END AS Relative_Id,
        CASE
            WHEN p2.Father_Id = p1.Person_Id OR p2.Mother_Id = p1.Person_Id THEN
                CASE p2.Gender 
                    WHEN 'M' THEN 'Son' 
                    WHEN 'F' THEN 'Daughter' 
                    ELSE NULL 
                END
            WHEN p2.Father_Id = p1.Father_Id OR p2.Mother_Id = p1.Mother_Id THEN
                CASE p2.Gender 
                    WHEN 'M' THEN 'Brother'
                    WHEN 'F' THEN 'Sister'
                    ELSE NULL
                END
            ELSE NULL
        END AS Connection_Type
    FROM peple p1
    JOIN peple p2
        ON (p1.Person_Id = p2.Father_Id
            OR p1.Person_Id = p2.Mother_Id
            OR p1.Father_Id = p2.Father_Id
            OR p1.Mother_Id = p2.Mother_Id)
            AND p1.Person_Id <> p2.Person_Id;

END //

DELIMITER ;

CALL GenerateFamilyRelationsSingleJoinCombinedCase();
SELECT * FROM Family_Relations;

/*tesk 3*/          
INSERT INTO Family_Relations(Person_Id, Relative_Id, Connection_Type)
SELECT
    t1.Relative_Id,
    t1.Person_Id,
    CASE t1.Connection_Type
        WHEN 'Husband' THEN 'Wife'
        WHEN 'Wife' THEN 'Husband'
        ELSE NULL
    END AS Connection_Type
FROM
    Family_Relations t1
WHERE
    t1.Connection_Type IN ('Husband', 'Wife')
    AND NOT EXISTS (
        SELECT *
        FROM Family_Relations t2
        WHERE t2.Person_Id = t1.Relative_Id
          AND t2.Relative_Id = t1.Person_Id
          AND t2.Connection_Type = CASE t1.Connection_Type
                                        WHEN 'Husband' THEN 'Wife'
                                        WHEN 'Wife' THEN 'Husband'
                                        ELSE NULL
                                    END)
		AND EXISTS (
        SELECT Person_Id
        FROM peple p
        WHERE p.Person_Id = t1.Relative_Id);
        
SELECT * 
FROM Family_Relations f1;