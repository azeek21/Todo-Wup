// Here's some sturctures for some object used in the app like user or todo

interface User {
    name: string,
    email: string, 
    uid: string,
    todos: [],
    joinDate: number,
    photoUrl: string,
    emailVerified: boolean,
    isAnonymous: boolean
};

// const  getUser = async () => {
//     console.log("User change");
//     console.log(user?.uid);
//     if (user.uid) {
//       const userRef = doc(db, "users", user.uid);
//       console.log("USERDOC CREATED")
//       const userDoc = await getDoc(userRef);
//       let userData = userDoc.data();
//       console.log("userDATA:", userData);
//       if (userDoc.exists()) {
//         console.log("EXISTS ")
//         console.log(userData.email);
//         console.log(userData.name);
//         console.log(userData.id);
//         console.log(userData.phone)
//         console.log(userData.joinDate);
//         console.log(dayjs.unix(userData.joinDate).format("DD:MM:YYYY HH:mm"));
//         setUser(userData);
//       }
//       else {
//         console.log("NOT EXIST");
        
//         userData = {
//           name: user.displayName,
//           email: user.email,
//           phone: user.phoneNumber,
//           uid: user.uid,
//           photoUrl: user.photoURL,
//           isAnonymous: user.isAnonymous,
//           emailVerified: user.emailVerified,
//           joinDate: dayjs().unix(),
//           todos: [],
//         }

//         try{
//           await setDoc(userRef, userData);
//           console.log("USER SET SUCCESS")
//           setUser(userData);         
//         } catch (error) {
//           console.log(error);
//         }
//       }
//     }
//     else {
//       console.log("USER NOT LOGGED IN");
//     }
//   };
//   getUser();